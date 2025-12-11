import { TRPCError } from "@trpc/server";
import {
	type SQL,
	and,
	count,
	desc,
	eq,
	gte,
	ilike,
	or,
	sql,
} from "drizzle-orm";
import { cache } from "react";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { jobs } from "@/server/db/schema";

function buildJobFilters(filters?: {
	remote?: boolean;
	location?: string;
	experienceLevel?: string;
	categories?: string[];
	employmentType?: string;
	searchQuery?: string;
}): SQL | undefined {
	const conditions: (SQL | undefined)[] = [eq(jobs.isExpired, false)];

	if (!filters) return and(...conditions);

	if (filters.remote) {
		conditions.push(eq(jobs.remoteDerived, true));
	}

	if (filters.location && filters.location.trim() !== "") {
		const locationPattern = `%${filters.location}%`;
		conditions.push(
			or(
				sql`${jobs.citiesDerived}::text ILIKE ${locationPattern}`,
				sql`${jobs.regionsDerived}::text ILIKE ${locationPattern}`,
				sql`${jobs.countriesDerived}::text ILIKE ${locationPattern}`,
			),
		);
	}

	if (filters.categories && filters.categories.length > 0) {
		conditions.push(
			or(
				...filters.categories.map(
					(category) =>
						// category must be the ACTUAL taxonomy string e.g. "Software"
						sql`${jobs.aiTaxonomiesA} @> ${JSON.stringify([category])}::jsonb`,
				),
			),
		);
	}

	if (filters.searchQuery && filters.searchQuery.trim() !== "") {
		const searchPattern = `%${filters.searchQuery}%`;
		conditions.push(
			or(
				ilike(jobs.title, searchPattern),
				ilike(jobs.organization, searchPattern),
			),
		);
	}

	return and(...conditions);
}

export const jobsRouter = createTRPCRouter({
	getJobs: publicProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(10).max(100).default(20),
				filters: z
					.object({
						remote: z.boolean().optional(),
						location: z.string().max(200).optional(),
						categories: z.array(z.string().max(100)).max(20).optional(),
						searchQuery: z.string().max(200).optional(),
					})
					.optional(),
			}),
		)
		.query(async ({ input }) => {
			const { page, limit, filters } = input;
			const offset = (page - 1) * limit;

			const filterConditions = buildJobFilters(filters);
			const totalResult = await db
				.select({ count: count() })
				.from(jobs)
				.where(filterConditions);

			const total = Number(totalResult[0]?.count ?? 0);
			const totalPages = Math.ceil(total / limit);

			const jobsResult = await db
				.select({
					id: jobs.id,
					title: jobs.title,
					organization: jobs.organization,
					datePosted: jobs.datePosted,
					citiesDerived: jobs.citiesDerived,
					countriesDerived: jobs.countriesDerived,
					remoteDerived: jobs.remoteDerived,
					aiExperienceLevel: jobs.aiExperienceLevel,
					employmentType: jobs.employmentType,
					aiSalaryMinvalue: jobs.aiSalaryMinvalue,
					aiSalaryMaxvalue: jobs.aiSalaryMaxvalue,
					aiSalaryCurrency: jobs.aiSalaryCurrency,
					aiTaxonomiesA: jobs.aiTaxonomiesA,
					aiWorkingHours: jobs.aiWorkingHours,
					aiJobLanguage: jobs.aiJobLanguage,
					aiVisaSponsorship: jobs.aiVisaSponsorship,
					aiCoreResponsibilities: jobs.aiCoreResponsibilities,
					linkedinOrgEmployees: jobs.linkedinOrgEmployees,
				})
				.from(jobs)
				.where(filterConditions)
				.orderBy(desc(jobs.datePosted))
				.limit(limit)
				.offset(offset);

			return {
				jobs: jobsResult,
				total,
				page,
				totalPages,
			};
		}),
	getJobDetails: publicProcedure
		.input(
			z.object({
				jobId: z.string().min(1, "Job ID is required"),
			}),
		)
		.query(async ({ input, ctx }) => {
			// Only allow server-side calls (RSC)
			const source = ctx.headers.get("x-trpc-source");
			if (source !== "rsc") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"This procedure is not allowed to be called from the client.",
				});
			}

			const { jobId } = input;
			const isPro = ctx.session?.user?.hasPro ?? false;

			const jobResult = await db
				.select()
				.from(jobs)
				.where(and(eq(jobs.id, jobId), eq(jobs.isExpired, false)))
				.limit(1);

			if (!jobResult[0]) return null;
			return jobResult[0];
		}),
	getJobsStats: publicProcedure.query(async () => {
		const now = new Date();
		const startOfDay = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		);

		const [totalResult, mostRecentJob] = await Promise.all([
			db
				.select({ count: count() })
				.from(jobs)
				.where(and(eq(jobs.isExpired, false), gte(jobs.createdAt, startOfDay))),
			db
				.select({ createdAt: jobs.createdAt })
				.from(jobs)
				.where(eq(jobs.isExpired, false))
				.orderBy(desc(jobs.createdAt))
				.limit(1),
		]);

		return {
			total: Number(totalResult[0]?.count ?? 0),
			mostRecentJobDate: mostRecentJob[0]?.createdAt ?? null,
		};
	}),
	getJobsCount: publicProcedure.query(async () => {
		const now = new Date();
		const startOfYesterday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() - 1,
		);

		const totalResult = await db
			.select({ count: count() })
			.from(jobs)
			.where(
				and(eq(jobs.isExpired, false), gte(jobs.createdAt, startOfYesterday)),
			);
		return Number(totalResult[0]?.count ?? 0);
	}),
	getJobCategories: publicProcedure.query(
		cache(async () => {
			// Extract categories with job counts from aiTaxonomiesA JSONB array
			// Using jsonb_array_elements_text to expand arrays and count jobs per category
			const result = await db.execute(
				sql`
					SELECT 
						jsonb_array_elements_text(ai_taxonomies_a) as category,
						COUNT(*) as count
					FROM internshipshq_jobs
					WHERE is_expired = false
						AND ai_taxonomies_a IS NOT NULL
						AND jsonb_array_length(ai_taxonomies_a) > 0
					GROUP BY category
					ORDER BY count DESC, category ASC
				`,
			);

			const rows = Array.isArray(result)
				? result
				: (result.rows as Array<{
						category: string;
						count: string | number;
					}>) || [];
			return rows
				.map((row) => ({
					category: row.category,
					count: Number(row.count) || 0,
				}))
				.filter((item): item is { category: string; count: number } =>
					Boolean(item.category),
				);
		}),
	),
});
