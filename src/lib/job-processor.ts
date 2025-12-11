import { db } from "@/server/db";
import { jobs } from "@/server/db/schema";
import { type SQL, sql } from "drizzle-orm";
import type { RapidAPIJobI } from "./types";

const BATCH_SIZE = 500;
export interface ProcessResultI {
	processed: number;
	skipped: number;
	errors: Array<{ jobId: string; error: string }>;
}

export class JobProcessor {
	async processJobs(apiJobs: RapidAPIJobI[]): Promise<ProcessResultI> {
		const result: ProcessResultI = {
			processed: 0,
			skipped: 0,
			errors: [],
		};

		if (!apiJobs.length) return result;

		// 1. Transform once
		const transformed = apiJobs.map((job) => this.transformJob(job));

		// 2. Chunk sequentially
		for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
			const chunk = transformed.slice(i, i + BATCH_SIZE);
			await this.bulkUpsertChunk(chunk, result);
		}

		return result;
	}

	/**
	 * Try bulk upsert for the whole chunk.
	 * On failure, fall back to per-row upserts to identify and skip only bad rows.
	 */
	private async bulkUpsertChunk(
		chunk: (typeof jobs.$inferInsert)[],
		result: ProcessResultI,
	): Promise<void> {
		if (!chunk.length) return;

		try {
			await db.transaction(async (tx) => {
				await tx.insert(jobs).values(chunk).onConflictDoUpdate({
					target: jobs.id,
					set: this.buildUpdateSet(),
				});
			});

			result.processed += chunk.length;
		} catch (error) {
			// Bulk failed: degrade gracefully to row-by-row for this chunk
			const message =
				error instanceof Error ? error.message : "Bulk upsert failed";

			// Try each row individually so one bad job doesn't kill the batch
			for (const job of chunk) {
				try {
					await db.insert(jobs).values(job).onConflictDoUpdate({
						target: jobs.id,
						set: this.buildUpdateSet(),
					});

					result.processed++;
				} catch (rowError) {
					result.skipped++;
					result.errors.push({
						jobId: job.id,
						error:
							rowError instanceof Error
								? rowError.message
								: message || "Unknown error",
					});
				}
			}
		}
	}

	/**
	 * Centralized ON CONFLICT ... DO UPDATE SET clause.
	 * Always prefers API as source of truth.
	 * Note: we intentionally do NOT touch `isExpired` here.
	 */
	private buildUpdateSet(): Record<string, SQL> {
		return {
			datePosted: sql`EXCLUDED.date_posted`,
			dateCreated: sql`EXCLUDED.date_created`,
			title: sql`EXCLUDED.title`,
			organization: sql`EXCLUDED.organization`,
			organizationUrl: sql`EXCLUDED.organization_url`,
			dateValidthrough: sql`EXCLUDED.date_validthrough`,
			url: sql`EXCLUDED.url`,
			sourceType: sql`EXCLUDED.source_type`,
			source: sql`EXCLUDED.source`,
			sourceDomain: sql`EXCLUDED.source_domain`,
			organizationLogo: sql`EXCLUDED.organization_logo`,
			domainDerived: sql`EXCLUDED.domain_derived`,

			locationsRaw: sql`EXCLUDED.locations_raw`,
			locationsAltRaw: sql`EXCLUDED.locations_alt_raw`,
			locationType: sql`EXCLUDED.location_type`,
			locationRequirementsRaw: sql`EXCLUDED.location_requirements_raw`,
			citiesDerived: sql`EXCLUDED.cities_derived`,
			countiesDerived: sql`EXCLUDED.counties_derived`,
			regionsDerived: sql`EXCLUDED.regions_derived`,
			countriesDerived: sql`EXCLUDED.countries_derived`,
			locationsDerived: sql`EXCLUDED.locations_derived`,
			timezonesDerived: sql`EXCLUDED.timezones_derived`,
			latsDerived: sql`EXCLUDED.lats_derived`,
			lngsDerived: sql`EXCLUDED.lngs_derived`,
			remoteDerived: sql`EXCLUDED.remote_derived`,

			descriptionHtml: sql`EXCLUDED.description_html`,
			descriptionText: sql`EXCLUDED.description_text`,

			employmentType: sql`EXCLUDED.employment_type`,
			salaryRaw: sql`EXCLUDED.salary_raw`,

			aiSalaryCurrency: sql`EXCLUDED.ai_salary_currency`,
			aiSalaryValue: sql`EXCLUDED.ai_salary_value`,
			aiSalaryMinvalue: sql`EXCLUDED.ai_salary_minvalue`,
			aiSalaryMaxvalue: sql`EXCLUDED.ai_salary_maxvalue`,
			aiSalaryUnittext: sql`EXCLUDED.ai_salary_unittext`,
			aiBenefits: sql`EXCLUDED.ai_benefits`,
			aiExperienceLevel: sql`EXCLUDED.ai_experience_level`,
			aiWorkArrangement: sql`EXCLUDED.ai_work_arrangement`,
			aiWorkArrangementOfficeDays: sql`EXCLUDED.ai_work_arrangement_office_days`,
			aiRemoteLocation: sql`EXCLUDED.ai_remote_location`,
			aiRemoteLocationDerived: sql`EXCLUDED.ai_remote_location_derived`,
			aiKeySkills: sql`EXCLUDED.ai_key_skills`,
			aiHiringManagerName: sql`EXCLUDED.ai_hiring_manager_name`,
			aiHiringManagerEmailAddress: sql`EXCLUDED.ai_hiring_manager_email_address`,
			aiCoreResponsibilities: sql`EXCLUDED.ai_core_responsibilities`,
			aiRequirementsSummary: sql`EXCLUDED.ai_requirements_summary`,
			aiWorkingHours: sql`EXCLUDED.ai_working_hours`,
			aiEmploymentType: sql`EXCLUDED.ai_employment_type`,
			aiJobLanguage: sql`EXCLUDED.ai_job_language`,
			aiVisaSponsorship: sql`EXCLUDED.ai_visa_sponsorship`,
			aiKeywords: sql`EXCLUDED.ai_keywords`,
			aiTaxonomiesA: sql`EXCLUDED.ai_taxonomies_a`,
			aiEducationRequirements: sql`EXCLUDED.ai_education_requirements`,

			linkedinOrgEmployees: sql`EXCLUDED.linkedin_org_employees`,
			linkedinOrgUrl: sql`EXCLUDED.linkedin_org_url`,
			linkedinOrgSize: sql`EXCLUDED.linkedin_org_size`,
			linkedinOrgSlogan: sql`EXCLUDED.linkedin_org_slogan`,
			linkedinOrgIndustry: sql`EXCLUDED.linkedin_org_industry`,
			linkedinOrgFollowers: sql`EXCLUDED.linkedin_org_followers`,
			linkedinOrgHeadquarters: sql`EXCLUDED.linkedin_org_headquarters`,
			linkedinOrgType: sql`EXCLUDED.linkedin_org_type`,
			linkedinOrgFoundeddate: sql`EXCLUDED.linkedin_org_foundeddate`,
			linkedinOrgSpecialties: sql`EXCLUDED.linkedin_org_specialties`,
			linkedinOrgLocations: sql`EXCLUDED.linkedin_org_locations`,
			linkedinOrgDescription: sql`EXCLUDED.linkedin_org_description`,
			linkedinOrgSlug: sql`EXCLUDED.linkedin_org_slug`,

			updatedAt: sql`CURRENT_TIMESTAMP`,
		};
	}

	/**
	 * Transform API → DB shape.
	 * Trusts API as source of truth.
	 * Let `createdAt` default in DB for new rows; only manage updatedAt via ON CONFLICT.
	 */
	private transformJob(apiJob: RapidAPIJobI): typeof jobs.$inferInsert {
		return {
			id: apiJob.id,
			datePosted: new Date(apiJob.date_posted),
			dateCreated: apiJob.date_created
				? new Date(apiJob.date_created)
				: undefined,
			title: apiJob.title,
			organization: apiJob.organization,
			organizationUrl: apiJob.organization_url ?? undefined,
			dateValidthrough: apiJob.date_validthrough
				? new Date(apiJob.date_validthrough)
				: undefined,
			url: apiJob.url,
			sourceType: apiJob.source_type ?? undefined,
			source: apiJob.source ?? undefined,
			sourceDomain: apiJob.source_domain ?? undefined,
			organizationLogo: apiJob.organization_logo ?? undefined,
			domainDerived: apiJob.domain_derived ?? undefined,

			locationsRaw: apiJob.locations_raw ?? undefined,
			locationsAltRaw: apiJob.locations_alt_raw ?? undefined,
			locationType: apiJob.location_type ?? undefined,
			locationRequirementsRaw: apiJob.location_requirements_raw ?? undefined,
			citiesDerived: apiJob.cities_derived ?? undefined,
			countiesDerived: apiJob.counties_derived ?? undefined,
			regionsDerived: apiJob.regions_derived ?? undefined,
			countriesDerived: apiJob.countries_derived ?? undefined,
			locationsDerived: apiJob.locations_derived ?? undefined,
			timezonesDerived: apiJob.timezones_derived ?? undefined,
			latsDerived: apiJob.lats_derived ?? undefined,
			lngsDerived: apiJob.lngs_derived ?? undefined,
			remoteDerived: apiJob.remote_derived ?? false,

			descriptionHtml: apiJob.description_html ?? undefined,
			descriptionText: apiJob.description_text ?? undefined,

			employmentType: apiJob.employment_type ?? undefined,
			salaryRaw: apiJob.salary_raw ?? undefined,

			aiSalaryCurrency: apiJob.ai_salary_currency ?? undefined,
			aiSalaryValue: apiJob.ai_salary_value ?? undefined,
			aiSalaryMinvalue: apiJob.ai_salary_minvalue ?? undefined,
			aiSalaryMaxvalue: apiJob.ai_salary_maxvalue ?? undefined,
			aiSalaryUnittext: apiJob.ai_salary_unittext ?? undefined,
			aiBenefits: apiJob.ai_benefits ?? undefined,
			aiExperienceLevel: apiJob.ai_experience_level ?? undefined,
			aiWorkArrangement: apiJob.ai_work_arrangement ?? undefined,
			aiWorkArrangementOfficeDays:
				apiJob.ai_work_arrangement_office_days ?? undefined,
			aiRemoteLocation: apiJob.ai_remote_location ?? undefined,
			aiRemoteLocationDerived: apiJob.ai_remote_location_derived ?? undefined,
			aiKeySkills: apiJob.ai_key_skills ?? undefined,
			aiHiringManagerName: apiJob.ai_hiring_manager_name ?? undefined,
			aiHiringManagerEmailAddress:
				apiJob.ai_hiring_manager_email_address ?? undefined,
			aiCoreResponsibilities: apiJob.ai_core_responsibilities ?? undefined,
			aiRequirementsSummary: apiJob.ai_requirements_summary ?? undefined,
			aiWorkingHours: apiJob.ai_working_hours ?? undefined,
			aiEmploymentType: apiJob.ai_employment_type ?? undefined,
			aiJobLanguage: apiJob.ai_job_language ?? undefined,
			aiVisaSponsorship: apiJob.ai_visa_sponsorship ?? false,
			aiKeywords: apiJob.ai_keywords ?? undefined,
			aiTaxonomiesA: apiJob.ai_taxonomies_a ?? undefined,
			aiEducationRequirements: apiJob.ai_education_requirements ?? undefined,

			linkedinOrgEmployees: apiJob.linkedin_org_employees ?? undefined,
			linkedinOrgUrl: apiJob.linkedin_org_url ?? undefined,
			linkedinOrgSize: apiJob.linkedin_org_size ?? undefined,
			linkedinOrgSlogan: apiJob.linkedin_org_slogan ?? undefined,
			linkedinOrgIndustry: apiJob.linkedin_org_industry ?? undefined,
			linkedinOrgFollowers: apiJob.linkedin_org_followers ?? undefined,
			linkedinOrgHeadquarters: apiJob.linkedin_org_headquarters ?? undefined,
			linkedinOrgType: apiJob.linkedin_org_type ?? undefined,
			linkedinOrgFoundeddate: apiJob.linkedin_org_foundeddate ?? undefined,
			linkedinOrgSpecialties: apiJob.linkedin_org_specialties ?? undefined,
			linkedinOrgLocations: apiJob.linkedin_org_locations ?? undefined,
			linkedinOrgDescription: apiJob.linkedin_org_description ?? undefined,
			linkedinOrgSlug: apiJob.linkedin_org_slug ?? undefined,

			// Let DB defaults handle createdAt/updatedAt for inserts.
			isExpired: false,
		};
	}

	async markJobsAsExpired(jobIds: number[]): Promise<number> {
		if (!jobIds.length) return 0;

		let updated = 0;
		const CHUNK = 1000;

		for (let i = 0; i < jobIds.length; i += CHUNK) {
			const slice = jobIds.slice(0, CHUNK);
			await db
				.update(jobs)
				.set({
					isExpired: true,
					updatedAt: new Date(),
				})
				.where(
					sql`${jobs.id} = ANY(ARRAY[${sql.join(
						slice.map((id) => sql`${id}`),
						sql`, `,
					)}])`,
				);

			// drizzle-orm/postgres-js doesn't always expose rowCount directly;
			// if you need exact count, you can run a SELECT with the same filter.
			updated += slice.length;
		}
		return updated;
	}
}

export const jobProcessor = new JobProcessor();
