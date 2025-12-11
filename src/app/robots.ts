import { env } from "@/env";
import { db } from "@/server/db";
import { jobs } from "@/server/db/schema";
import { count } from "drizzle-orm";
import type { MetadataRoute } from "next";

const baseUrl = env.NEXT_PUBLIC_HOST_URL;

export default async function robots(): Promise<MetadataRoute.Robots> {
	const totalJobs = await db.select({ count: count() }).from(jobs);
	const jobCount = Number(totalJobs[0]?.count ?? 0);

	const jobsPerSitemap = 500;
	const numberOfSitemaps = Math.ceil(jobCount / jobsPerSitemap);

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api", "/auth/signup", "/auth/signin"],
		},
		sitemap: Array.from(
			{ length: numberOfSitemaps },
			(_, i) => `${baseUrl}/sitemap/${i}.xml`,
		),
	};
}
1;
