import { jobProcessor } from "@/lib/job-processor";
import { logsnag } from "@/lib/logsnag";
import { rapidAPIClient } from "@/lib/rapidapi-client";
import type {
	BudgetStatusI,
	FetchJobsOptionsI,
	SyncResultI,
} from "@/lib/types";
import { usageTracker } from "@/lib/usage-tracker";
import { db } from "@/server/db";
import { jobs } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Job Sync Service
 * Main orchestrator that coordinates all other services
 * Flow: Check budget → Fetch from API → Process jobs → Record usage → Log events
 * Called by: Cron endpoints and admin backfill API
 */

export class JobSyncService {
	/**
	 * Gets total active jobs count from database
	 * Used for LogSnag notifications
	 */
	private async getActiveJobsCount(): Promise<number> {
		const result = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(jobs)
			.where(eq(jobs.isExpired, false));

		return Number(result[0]?.count ?? 0);
	}

	private async getTotalJobsCount(): Promise<number> {
		const result = await db.select({ count: sql<number>`COUNT(*)` }).from(jobs);
		return Number(result[0]?.count ?? 0);
	}

	private async validateBudget(
		estimatedRequests: number,
		estimatedJobs: number,
	): Promise<void> {
		const budgetCheck = await usageTracker.checkBudget(
			estimatedRequests,
			estimatedJobs,
		);
		if (!budgetCheck.allowed) {
			const budgetUtilization = await usageTracker.getBudgetUtilization();
			const billingPeriod = await usageTracker.getBillingPeriodInfo();
			await logsnag.budgetExceeded("requests", {
				used: budgetUtilization.requests.used,
				limit: budgetUtilization.requests.limit,
				resetAt: billingPeriod.resetAt,
				daysUntilReset: billingPeriod.daysUntilReset ?? undefined,
			});

			throw new Error("Monthly API budget exceeded");
		}
	}

	private async getBudgetStatus(): Promise<BudgetStatusI> {
		const budgetUtilization = await usageTracker.getBudgetUtilization();
		const billingPeriod = await usageTracker.getBillingPeriodInfo();

		if (budgetUtilization.requests.percentage > 80) {
			await logsnag.budgetWarning(
				budgetUtilization.requests.used,
				budgetUtilization.requests.limit,
				"requests",
				{
					daysUntilReset: billingPeriod.daysUntilReset ?? undefined,
					resetAt: billingPeriod.resetAt,
				},
			);
		}
		if (budgetUtilization.jobs.percentage > 80) {
			await logsnag.budgetWarning(
				budgetUtilization.jobs.used,
				budgetUtilization.jobs.limit,
				"jobs",
				{
					daysUntilReset: billingPeriod.daysUntilReset ?? undefined,
					resetAt: billingPeriod.resetAt,
				},
			);
		}

		return budgetUtilization;
	}

	/**
	 * Syncs jobs from last hour (firehose endpoint)
	 * Called by: /api/cron/firehose
	 * Default limit: 100 jobs
	 * Counts towards: Requests AND Jobs budget
	 */
	async syncHourlyJobs(options: FetchJobsOptionsI = {}): Promise<SyncResultI> {
		const limit = 100;
		const startTime = Date.now();

		try {
			await this.validateBudget(1, limit);
			const { data: apiJobs, rateLimit } =
				await rapidAPIClient.fetchHourlyJobs(options);
			const processResult = await jobProcessor.processJobs(apiJobs);

			if (processResult.errors.length > 0) {
				await logsnag.syncError(
					"/active-ats-1h",
					"One Hour Jobs Sync Got some errors",
					{ errors: processResult.errors },
				);
			}

			const responseTime = Date.now() - startTime;
			const activeJobsCount = await this.getActiveJobsCount();
			await usageTracker.recordUsage(
				"/active-ats-1h",
				apiJobs.length,
				responseTime,
				rateLimit,
			);
			const budgetStatus = await this.getBudgetStatus();
			await logsnag.jobsSynced(
				processResult.processed,
				"hourly",
				processResult.skipped,
				{
					responseTime,
					totalJobs: activeJobsCount,
					endpoint: "/active-ats-1h",
				},
			);

			return {
				success: true,
				...processResult,
				responseTime,
				apiUsage: {
					requests: 1,
					jobs: apiJobs.length,
				},
				budgetStatus,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			const responseTime = Date.now() - startTime;
			await usageTracker.recordError("/active-ats-1h", errorMessage);
			await logsnag.syncError("/active-ats-1h", errorMessage, {
				responseTime,
			});

			return {
				success: false,
				processed: 0,
				skipped: 0,
				responseTime: Date.now() - startTime,
				errors: [{ jobId: "N/A", error: errorMessage }],
				apiUsage: { requests: 0, jobs: 0 },
				budgetStatus: {
					requests: { used: 0, limit: 0, percentage: 0 },
					jobs: { used: 0, limit: 0, percentage: 0 },
				},
			};
		}
	}

	/**
	 * Syncs jobs from last 24 hours
	 * Called by: /api/cron/daily
	 * Default targetJobs: 200 jobs (paginated automatically)
	 * Counts towards: Requests AND Jobs budget
	 */
	async syncDailyJobs(options: FetchJobsOptionsI = {}): Promise<SyncResultI> {
		const startTime = Date.now();
		const targetJobs = options.targetJobs ?? 500;
		const estimatedRequests = Math.ceil(targetJobs / 100);

		try {
			await this.validateBudget(estimatedRequests, targetJobs);
			const { data: apiJobs, rateLimit } =
				await rapidAPIClient.fetchDailyJobsPaginated(targetJobs, options);
			const processResult = await jobProcessor.processJobs(apiJobs);

			if (processResult.errors.length > 0) {
				await logsnag.syncError(
					"/active-ats-24h",
					"Daily Jobs Sync Got some errors",
					{ errors: processResult.errors },
				);
			}

			const responseTime = Date.now() - startTime;
			const actualRequests = Math.ceil(apiJobs.length / 100);

			const activeJobsCount = await this.getActiveJobsCount();
			await usageTracker.recordUsage(
				"/active-ats-24h",
				apiJobs.length,
				responseTime,
				rateLimit,
			);
			await logsnag.jobsSynced(
				processResult.processed,
				"daily",
				processResult.skipped,
				{
					responseTime,
					totalJobs: activeJobsCount,
					endpoint: "/active-ats-24h",
				},
			);
			const budgetStatus = await this.getBudgetStatus();

			return {
				success: true,
				...processResult,
				responseTime,
				apiUsage: {
					requests: actualRequests,
					jobs: apiJobs.length,
				},
				budgetStatus,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			const responseTime = Date.now() - startTime;
			await usageTracker.recordError("/active-ats-24h", errorMessage);
			await logsnag.syncError("/active-ats-24h", errorMessage, {
				responseTime,
			});

			return {
				success: false,
				processed: 0,
				skipped: 0,
				responseTime: Date.now() - startTime,
				errors: [{ jobId: "N/A", error: errorMessage }],
				apiUsage: { requests: 0, jobs: 0 },
				budgetStatus: {
					requests: { used: 0, limit: 0, percentage: 0 },
					jobs: { used: 0, limit: 0, percentage: 0 },
				},
			};
		}
	}

	/**
	 * Syncs jobs that were modified in last 24 hours
	 * Called by: /api/cron/modified
	 * Default targetJobs: 500 jobs (paginated automatically if needed)
	 * Counts towards: Requests ONLY (NOT Jobs budget)
	 */
	async syncModifiedJobs(targetJobs = 500): Promise<SyncResultI> {
		const startTime = Date.now();

		try {
			const apiJobs =
				await rapidAPIClient.fetchModifiedJobsPaginated(targetJobs);
			const processResult = await jobProcessor.processJobs(apiJobs);

			if (processResult.errors.length > 0) {
				await logsnag.syncError(
					"/modified-ats",
					"Modified Jobs Sync Got some errors",
					{ errors: processResult.errors },
				);
			}

			const responseTime = Date.now() - startTime;
			const activeJobsCount = await this.getActiveJobsCount();
			await logsnag.jobsSynced(
				processResult.processed,
				"modified",
				processResult.skipped,
				{
					responseTime,
					totalJobs: activeJobsCount,
					endpoint: "/modified-ats",
				},
			);

			return {
				success: true,
				...processResult,
				responseTime,
				apiUsage: {
					requests: 0,
					jobs: 0,
				},
				budgetStatus: {} as BudgetStatusI,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			const responseTime = Date.now() - startTime;
			await usageTracker.recordError("/modified-ats", errorMessage);
			await logsnag.syncError("/modified-ats", errorMessage, {
				responseTime,
			});

			return {
				success: false,
				processed: 0,
				skipped: 0,
				responseTime: Date.now() - startTime,
				errors: [{ jobId: "N/A", error: errorMessage }],
				apiUsage: { requests: 0, jobs: 0 },
				budgetStatus: {} as BudgetStatusI,
			};
		}
	}

	/**
	 * Marks expired jobs as expired (soft delete)
	 * Called by: /api/cron/expired
	 * Returns: Array of job IDs (not full objects)
	 * Counts towards: Requests ONLY (NOT Jobs budget)
	 */
	async syncExpiredJobs(): Promise<{
		success: boolean;
		markedExpired: number;
		responseTime: number;
	}> {
		const startTime = Date.now();

		try {
			const expiredJobIds = await rapidAPIClient.fetchExpiredJobs();
			const markedCount = await jobProcessor.markJobsAsExpired(expiredJobIds);
			const responseTime = Date.now() - startTime;
			const activeJobsCount = await this.getActiveJobsCount();
			const totalJobsCount = await this.getTotalJobsCount();
			await logsnag.expiredJobsMarked(markedCount, {
				activeJobs: activeJobsCount,
				totalJobs: totalJobsCount,
			});
			return {
				success: true,
				markedExpired: markedCount,
				responseTime,
			};
		} catch (error) {
			console.error(error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			const responseTime = Date.now() - startTime;
			await usageTracker.recordError("/active-ats-expired", errorMessage);
			await logsnag.syncError("/active-ats-expired", errorMessage, {
				responseTime,
			});

			return {
				success: false,
				markedExpired: 0,
				responseTime: Date.now() - startTime,
			};
		}
	}
}

export const jobSyncService = new JobSyncService();
