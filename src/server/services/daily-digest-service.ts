import { render } from "@react-email/render";
import { and, desc, eq, gte } from "drizzle-orm";
import type React from "react";

import { DailyDigestEmail } from "@/components/views/mails";
import { env } from "@/env";
import { logsnag } from "@/lib/logsnag";
import { resend } from "@/lib/serverUtils";
import { db } from "@/server/db";
import { emailSubscribers, jobs, users } from "@/server/db/schema";

import type { JobCardI } from "@/lib/types";

interface UserStatus {
	subscriber: typeof emailSubscribers.$inferSelect;
	isPro: boolean;
}

/**
 * Select diverse jobs from different categories
 * Algorithm: Round-robin selection from category buckets
 */
function selectDiverseJobs(allJobs: JobCardI[], limit: number): JobCardI[] {
	// Group jobs by category (ai_taxonomies_a)
	const jobsByCategory = new Map<string, JobCardI[]>();

	for (const job of allJobs) {
		if (job.aiTaxonomiesA && job.aiTaxonomiesA.length > 0) {
			for (const category of job.aiTaxonomiesA) {
				if (!jobsByCategory.has(category)) {
					jobsByCategory.set(category, []);
				}
				// Only add if job not already in this category's list
				const categoryJobs = jobsByCategory.get(category);
				if (categoryJobs && !categoryJobs.some((j) => j.id === job.id)) {
					categoryJobs.push(job);
				}
			}
		} else {
			// Jobs without categories go to "Uncategorized"
			if (!jobsByCategory.has("Uncategorized")) {
				jobsByCategory.set("Uncategorized", []);
			}
			const uncategorized = jobsByCategory.get("Uncategorized");
			if (uncategorized) {
				uncategorized.push(job);
			}
		}
	}

	// Select jobs using round-robin across categories
	const selected: JobCardI[] = [];
	const categories = Array.from(jobsByCategory.keys());
	const selectedIds = new Set<string>();

	let categoryIndex = 0;
	while (selected.length < limit && categories.length > 0) {
		const category = categories[categoryIndex];
		if (!category) break;

		const categoryJobs = jobsByCategory.get(category);

		if (categoryJobs && categoryJobs.length > 0) {
			// Find first job in category that hasn't been selected
			const job = categoryJobs.shift();
			if (job && !selectedIds.has(job.id)) {
				selected.push(job);
				selectedIds.add(job.id);
			}
		}

		// Remove category if empty
		if (!categoryJobs || categoryJobs.length === 0) {
			categories.splice(categoryIndex, 1);
			if (categoryIndex >= categories.length) {
				categoryIndex = 0;
			}
		} else {
			categoryIndex = (categoryIndex + 1) % categories.length;
		}
	}

	return selected;
}

/**
 * Get user statuses (pro vs free)
 */
async function getUserStatuses(
	subscribers: Array<typeof emailSubscribers.$inferSelect>,
): Promise<UserStatus[]> {
	return Promise.all(
		subscribers.map(async (subscriber) => {
			const user = await db
				.select()
				.from(users)
				.where(eq(users.email, subscriber.email))
				.limit(1);

			return {
				subscriber,
				isPro: true,
			};
		}),
	);
}

/**
 * Send daily digest email
 */
export async function sendDailyDigest(): Promise<{
	successCount: number;
	errorCount: number;
	proCount: number;
	freeCount: number;
	duration: number;
}> {
	const startTime = Date.now();
	await logsnag.log({
		channel: "cron",
		event: "Daily Digest Started",
		description: "Starting daily digest email process",
		icon: "📧",
		notify: false,
	});

	try {
		// 1. Fetch jobs from last 24 hours
		const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const recentJobs = await db
			.select({
				id: jobs.id,
				title: jobs.title,
				organization: jobs.organization,
				aiSalaryMinvalue: jobs.aiSalaryMinvalue,
				aiSalaryMaxvalue: jobs.aiSalaryMaxvalue,
				aiSalaryCurrency: jobs.aiSalaryCurrency,
				aiTaxonomiesA: jobs.aiTaxonomiesA,
				aiExperienceLevel: jobs.aiExperienceLevel,
				employmentType: jobs.employmentType,
				datePosted: jobs.datePosted,
				aiWorkingHours: jobs.aiWorkingHours,
				aiJobLanguage: jobs.aiJobLanguage,
				aiVisaSponsorship: jobs.aiVisaSponsorship,
				aiCoreResponsibilities: jobs.aiCoreResponsibilities,
				linkedinOrgEmployees: jobs.linkedinOrgEmployees,
				remoteDerived: jobs.remoteDerived,
			})
			.from(jobs)
			.where(
				and(
					eq(jobs.isExpired, false),
					gte(jobs.datePosted, twentyFourHoursAgo),
				),
			)
			.orderBy(desc(jobs.datePosted))
			.limit(500); // Get more than needed for diversity

		if (recentJobs.length === 0) {
			await logsnag.log({
				channel: "cron",
				event: "Daily Digest Skipped",
				description: "No jobs found in last 24 hours",
				icon: "⚠️",
				notify: true,
			});
			return {
				successCount: 0,
				errorCount: 0,
				proCount: 0,
				freeCount: 0,
				duration: Date.now() - startTime,
			};
		}

		// 2. Get all active subscribers
		const subscribers = await db
			.select()
			.from(emailSubscribers)
			.where(eq(emailSubscribers.isSubscribed, true));

		if (subscribers.length === 0) {
			await logsnag.log({
				channel: "cron",
				event: "Daily Digest Skipped",
				description: "No active subscribers",
				icon: "⚠️",
				notify: false,
			});
			return {
				successCount: 0,
				errorCount: 0,
				proCount: 0,
				freeCount: 0,
				duration: Date.now() - startTime,
			};
		}

		// 3. Determine user statuses
		const userStatuses = await getUserStatuses(subscribers);
		let proCount = 0;
		let freeCount = 0;

		// 4. Send emails in batches
		const BATCH_SIZE = 50;
		let successCount = 0;
		let errorCount = 0;

		for (let i = 0; i < userStatuses.length; i += BATCH_SIZE) {
			const batch = userStatuses.slice(i, i + BATCH_SIZE);

			await Promise.all(
				batch.map(async ({ subscriber, isPro }) => {
					try {
						// Filter jobs by user's selected categories
						const userCategories = subscriber.categories || [];
						const filteredJobs =
							userCategories.length > 0
								? recentJobs.filter((job) =>
										job.aiTaxonomiesA?.some((cat) =>
											userCategories.includes(cat),
										),
									)
								: recentJobs; // Backward compatibility: if no categories, send all jobs

						// Select appropriate number of jobs from filtered results
						const jobsToSend = selectDiverseJobs(filteredJobs, isPro ? 10 : 5);

						if (isPro) {
							proCount++;
						} else {
							freeCount++;
						}

						// Render email
						const emailHtml = await render(
							DailyDigestEmail({
								jobs: jobsToSend,
								isPro,
								unsubscribeUrl: `${env.NEXT_PUBLIC_HOST_URL}/api/unsubscribe/daily-digest?token=${subscriber.unsubscribeToken}`,
								baseUrl: env.NEXT_PUBLIC_HOST_URL,
								totalJobCount: recentJobs.length,
							}) as React.ReactElement,
						);

						// Send email
						await resend.emails.send({
							from: `InternshipsHQ <${env.RESEND_DOMAIN}>`,
							to: subscriber.email,
							subject: "🎯 Today's fresh internships",
							html: emailHtml,
						});

						successCount++;
					} catch (error) {
						errorCount++;
						await logsnag.error("Failed to send digest email", {
							email: subscriber.email,
							error: error instanceof Error ? error.message : "Unknown",
						});
					}
				}),
			);

			// Delay between batches to respect rate limits
			if (i + BATCH_SIZE < userStatuses.length) {
				await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second
			}
		}

		const duration = Date.now() - startTime;

		// Log completion
		await logsnag.log({
			channel: "cron",
			event: "Daily Digest Completed",
			description: `Sent ${successCount} emails (${errorCount} failures)`,
			icon: "✅",
			notify: true,
			tags: {
				success_count: successCount,
				error_count: errorCount,
				duration_seconds: Math.round(duration / 1000),
				pro_users: proCount,
				free_users: freeCount,
				total_jobs: recentJobs.length,
			},
		});

		return {
			successCount,
			errorCount,
			proCount,
			freeCount,
			duration,
		};
	} catch (error) {
		await logsnag.error("Daily digest failed", {
			error: error instanceof Error ? error.message : "Unknown",
			...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
		});

		throw error;
	}
}
