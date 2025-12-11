import { render } from "@react-email/render";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import type React from "react";

import { JobAlertEmail } from "@/components/views/mails";
import { env } from "@/env";
import { logsnag } from "@/lib/logsnag";
import { resend } from "@/lib/serverUtils";
import { db } from "@/server/db";
import { alertPreferences, jobs, users } from "@/server/db/schema";

import type { JobCardI } from "@/lib/types";

type AlertPreference = Pick<
	typeof alertPreferences.$inferSelect,
	"id" | "userId" | "name" | "keywords" | "locations" | "remoteOnly"
>;

interface AlertMatch {
	alert: AlertPreference;
	user: typeof users.$inferSelect;
	matches: JobCardI[];
}

/**
 * Match jobs against alert preferences
 * Uses AND logic across fields, OR logic within arrays
 * Optimized with early returns and normalized string matching
 */
function matchJobsToAlert(
	allJobs: JobCardI[],
	alert: AlertPreference,
): JobCardI[] {
	// Normalize alert arrays once for better performance
	const normalizedLocations =
		alert.locations && alert.locations.length > 0
			? alert.locations.map((loc) => loc.toLowerCase().trim())
			: null;
	const normalizedKeywords =
		alert.keywords && alert.keywords.length > 0
			? alert.keywords.map((keyword) => keyword.toLowerCase().trim())
			: null;

	return allJobs.filter((job) => {
		// Match locations (OR logic) - check cities, countries, regions
		if (normalizedLocations) {
			const jobLocations = [
				...(job.citiesDerived || []),
				...(job.countriesDerived || []),
			]
				.map((loc) => loc.toLowerCase().trim())
				.join(" ");

			// If alert specifies locations, job must have matching location data
			if (
				jobLocations.length === 0 ||
				!normalizedLocations.some((loc) => jobLocations.includes(loc))
			) {
				return false;
			}
		}

		// Match categories/keywords (OR logic)
		if (
			normalizedKeywords &&
			job.aiTaxonomiesA &&
			job.aiTaxonomiesA.length > 0
		) {
			const normalizedCategories = job.aiTaxonomiesA.map((cat) =>
				cat.toLowerCase().trim(),
			);
			if (
				!normalizedCategories.some((category) =>
					normalizedKeywords.some((keyword) => category.includes(keyword)),
				)
			) {
				return false;
			}
		}

		// Match remote preference
		if (alert.remoteOnly && job.remoteDerived !== true) {
			return false;
		}

		// All conditions passed
		return true;
	});
}

/**
 * Send job alert emails
 */
export async function sendJobAlerts(): Promise<{
	successCount: number;
	errorCount: number;
	alertsProcessed: number;
	jobsMatched: number;
	duration: number;
}> {
	const startTime = Date.now();

	await logsnag.log({
		channel: "cron",
		event: "Job Alerts Started",
		description: "Starting job alerts email process",
		icon: "🔔",
		notify: false,
	});

	try {
		// 1. Fetch jobs from last 6 hours
		const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
		const recentJobs = await db
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
			.where(and(eq(jobs.isExpired, false), gte(jobs.createdAt, sixHoursAgo)))
			.orderBy(desc(jobs.createdAt));

		if (recentJobs.length === 0) {
			await logsnag.log({
				channel: "cron",
				event: "Job Alerts Skipped",
				description: "No jobs found in last 6 hours",
				icon: "⚠️",
				notify: false,
			});
			return {
				successCount: 0,
				errorCount: 0,
				alertsProcessed: 0,
				jobsMatched: 0,
				duration: Date.now() - startTime,
			};
		}

		// 2. Get all active alert preferences
		const alerts = await db
			.select({
				alert: alertPreferences,
				user: users,
			})
			.from(alertPreferences)
			.innerJoin(users, eq(alertPreferences.userId, users.id))
			.where(eq(alertPreferences.isActive, true));

		if (alerts.length === 0) {
			await logsnag.log({
				channel: "cron",
				event: "Job Alerts Skipped",
				description: "No active alerts found",
				icon: "⚠️",
				notify: false,
			});
			return {
				successCount: 0,
				errorCount: 0,
				alertsProcessed: 0,
				jobsMatched: 0,
				duration: Date.now() - startTime,
			};
		}

		// 3. Match jobs to alerts
		const matches: AlertMatch[] = [];
		let totalJobsMatched = 0;

		for (const { alert, user } of alerts) {
			const alertMatches = matchJobsToAlert(recentJobs, alert);

			if (alertMatches.length > 0) {
				matches.push({
					alert,
					user,
					matches: alertMatches.slice(0, 10), // Limit 10 jobs per alert
				});
				totalJobsMatched += alertMatches.length;
			}
		}

		// 4. Send emails
		let successCount = 0;
		let errorCount = 0;

		for (const { alert, user, matches: jobMatches } of matches) {
			try {
				// Render email
				const emailHtml = await render(
					JobAlertEmail({
						alertName: alert.name,
						jobs: jobMatches,
						baseUrl: env.NEXT_PUBLIC_HOST_URL,
						totalJobCount: recentJobs.length,
					}) as React.ReactElement,
				);

				// Send email
				await resend.emails.send({
					from: `InternshipsHQ <${env.RESEND_DOMAIN}>`,
					to: user.email ?? "",
					subject: `🔔 ${jobMatches.length} New ${jobMatches.length === 1 ? "Internship" : "Internships"} Matching "${alert.name}"`,
					html: emailHtml,
				});

				// Update alert statistics
				await db
					.update(alertPreferences)
					.set({
						lastAlertSentAt: new Date(),
						alertsSentCount: sql`${alertPreferences.alertsSentCount} + 1`,
					})
					.where(eq(alertPreferences.id, alert.id));

				successCount++;
			} catch (error) {
				errorCount++;
				await logsnag.error("Failed to send job alert", {
					email: user.email,
					alert_name: alert.name,
					error: error instanceof Error ? error.message : "Unknown",
				});
			}
		}

		const duration = Date.now() - startTime;

		// Log completion
		await logsnag.log({
			channel: "cron",
			event: "Job Alerts Completed",
			description: `Sent ${successCount} alert emails (${errorCount} failures)`,
			icon: "✅",
			notify: true,
			tags: {
				success_count: successCount,
				error_count: errorCount,
				duration_seconds: Math.round(duration / 1000),
				alerts_processed: matches.length,
				total_jobs: recentJobs.length,
				jobs_matched: totalJobsMatched,
			},
		});

		return {
			successCount,
			errorCount,
			alertsProcessed: matches.length,
			jobsMatched: totalJobsMatched,
			duration,
		};
	} catch (error) {
		await logsnag.error("JobCardI alerts failed", {
			error: error instanceof Error ? error.message : "Unknown",
			...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
		});

		throw error;
	}
}
