import { siteConfig } from "@/config/site";
import { env } from "@/env";
import type { PostT } from "@/lib/types";
import { api } from "@/trpc/server";
import type { MetadataRoute } from "next";

const baseUrl = env.NEXT_PUBLIC_HOST_URL;

import { staticPages } from "@/config/static-pages";
import { db } from "@/server/db";
import { jobs } from "@/server/db/schema";
import { count, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export async function generateSitemaps() {
	const totalJobs = await db.select({ count: count() }).from(jobs);
	const jobCount = Number(totalJobs[0]?.count ?? 0);
	const jobsPerSitemap = 500;
	const numberOfSitemaps = Math.ceil(jobCount / jobsPerSitemap);

	return Array.from({ length: numberOfSitemaps }, (_, index) => ({
		id: index,
		offset: index * jobsPerSitemap,
		limit: jobsPerSitemap,
	}));
}

export default async function sitemap({
	id,
	offset,
	limit,
}: {
	id: string;
	offset: number;
	limit: number;
}): Promise<MetadataRoute.Sitemap> {
	const metadata: MetadataRoute.Sitemap = [];
	if (id === "0") {
		const { posts } = await api.blog.getPosts({
			page: 1,
			limit: 50,
		});
		metadata.push(
			{
				url: baseUrl,
				lastModified: new Date(),
				changeFrequency: "monthly" as const,
			},
			...siteConfig.mainNav
				.filter((page) => page.type === "link")
				.map((page) => ({
					url: `${baseUrl}${page.href}`,
					lastModified: new Date(),
					changeFrequency: "monthly" as const,
				})),
			// PSEO Pages
			...Object.keys(staticPages).map((pageKey) => ({
				url: `${baseUrl}/${pageKey}/jobs`,
				lastModified: new Date(),
				changeFrequency: "daily" as const,
				priority: 0.8,
			})),
			//   Blog
			{
				url: `${baseUrl}/blog`,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 0.8,
			},
			...((Array.isArray(posts)
				? posts.map((post: PostT) => ({
						url: `${baseUrl}/blog/${post.slug}`,
						lastModified: new Date(post.published_at),
						changeFrequency: "monthly" as const,
						priority: 0.8,
					}))
				: []) as MetadataRoute.Sitemap),
		);
	}

	const jobsResult = await db
		.select({
			id: jobs.id,
			datePosted: jobs.datePosted,
		})
		.from(jobs)
		.where(eq(jobs.isExpired, false))
		.orderBy(desc(jobs.datePosted))
		.limit(limit)
		.offset(offset);

	return [
		...metadata,
		...jobsResult.map((job) => ({
			url: `${baseUrl}/jobs/${job.id}`,
			lastModified: job.datePosted ? new Date(job.datePosted) : new Date(),
			priority: 0.7,
		})),
	];
}
