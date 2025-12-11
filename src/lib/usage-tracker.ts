import { db } from "@/server/db";
import { apiConfig, apiUsageLogs } from "@/server/db/schema";
import { and, desc, eq, gte, isNotNull, lt, sql } from "drizzle-orm";
import type { RapidAPIRateLimitHeadersI } from "./types";

/**
 * Usage Tracker
 * Manages API budget based on RapidAPI billing period (not calendar month)
 * Tracks usage, checks budget before API calls, records successful/failed requests
 * Note: Modified/Expired endpoints count towards Requests only (NOT Jobs)
 * Uses billing period reset timestamps from API headers for accurate tracking
 */
export class UsageTracker {
	/**
	 * Calculates billing period reset timestamp from API header
	 * resetTime is seconds until reset, so we add it to current time
	 */
	private calculateResetTimestamp(resetTimeSeconds: number): Date {
		return new Date(Date.now() + resetTimeSeconds * 1000);
	}

	/**
	 * Gets the current billing period reset timestamp from api_config
	 * Falls back to null if not set
	 */
	private async getCurrentBillingPeriodReset(): Promise<Date | null> {
		const result = await db
			.select({ resetAt: apiConfig.billingPeriodResetAt })
			.from(apiConfig)
			.orderBy(apiConfig.id)
			.limit(1);

		return result[0]?.resetAt ?? null;
	}

	/**
	 * Gets dynamic limits from api_config table
	 * Falls back to defaults if not set
	 */
	private async getDynamicLimits(): Promise<{
		requestsLimit: number;
		jobsLimit: number;
	}> {
		const result = await db
			.select({
				requestsLimit: apiConfig.requestsLimit,
				jobsLimit: apiConfig.jobsLimit,
			})
			.from(apiConfig)
			.orderBy(apiConfig.id)
			.limit(1);

		if (result[0]?.requestsLimit && result[0]?.jobsLimit) {
			return {
				requestsLimit: result[0].requestsLimit,
				jobsLimit: result[0].jobsLimit,
			};
		}

		return {
			requestsLimit: 20000,
			jobsLimit: 20000,
		};
	}

	/**
	 * Checks if we have sufficient budget for planned API call
	 * Called BEFORE making any API request
	 * Returns: allowed flag + current usage + remaining budget
	 * Uses dynamic limits from API headers and billing period tracking
	 */
	async checkBudget(
		requestsNeeded: number,
		jobsNeeded: number,
	): Promise<{
		allowed: boolean;
		currentUsage: {
			totalRequests: number;
			totalJobs: number;
		};
		remainingRequests: number;
		remainingJobs: number;
	}> {
		const currentUsage = await this.getCurrentBillingPeriodUsage();
		const limits = await this.getDynamicLimits();
		const canProceed =
			currentUsage.totalRequests + requestsNeeded <= limits.requestsLimit &&
			currentUsage.totalJobs + jobsNeeded <= limits.jobsLimit;

		return {
			allowed: canProceed,
			currentUsage,
			remainingRequests: limits.requestsLimit - currentUsage.totalRequests,
			remainingJobs: limits.jobsLimit - currentUsage.totalJobs,
		};
	}

	/**
	 * Records successful API usage
	 * Called AFTER successful API request
	 * Note: Modified/Expired endpoints set jobsFetched to 0 (don't count towards Jobs budget)
	 * Updates api_config table with latest rate limit info (single row, always updated)
	 */
	async recordUsage(
		endpoint: string,
		jobsFetched: number,
		responseTimeMs: number,
		rateLimit?: RapidAPIRateLimitHeadersI,
	): Promise<void> {
		const countsTowardsJobs =
			!endpoint.includes("modified") && !endpoint.includes("expired");

		const billingPeriodResetAt = rateLimit?.resetTime
			? this.calculateResetTimestamp(rateLimit.resetTime)
			: null;

		if (rateLimit) {
			const existing = await db
				.select({ id: apiConfig.id })
				.from(apiConfig)
				.orderBy(apiConfig.id)
				.limit(1);

			if (existing[0]) {
				await db
					.update(apiConfig)
					.set({
						jobsLimit: rateLimit.jobsLimit,
						jobsRemaining: rateLimit.jobsRemaining,
						requestsLimit: rateLimit.requestsLimit,
						requestsRemaining: rateLimit.requestsRemaining,
						billingPeriodResetAt,
						updatedAt: new Date(),
					})
					.where(eq(apiConfig.id, existing[0].id));
			} else {
				await db.insert(apiConfig).values({
					jobsLimit: rateLimit.jobsLimit,
					jobsRemaining: rateLimit.jobsRemaining,
					requestsLimit: rateLimit.requestsLimit,
					requestsRemaining: rateLimit.requestsRemaining,
					billingPeriodResetAt,
					updatedAt: new Date(),
				});
			}
		}

		await db.insert(apiUsageLogs).values({
			timestamp: new Date(),
			endpoint,
			jobsFetched: countsTowardsJobs ? jobsFetched : 0,
			requestCount: 1,
			responseTimeMs: responseTimeMs,
			status: "success",
			errorMessage: null,
			billingPeriodResetAt: billingPeriodResetAt,
		});
	}

	/**
	 * Records failed API request
	 * Sets request_count and jobs_fetched to 0 (errors don't count against budget)
	 */
	async recordError(endpoint: string, errorMessage: string): Promise<void> {
		await db.insert(apiUsageLogs).values({
			timestamp: new Date(),
			endpoint,
			jobsFetched: 0,
			requestCount: 0,
			responseTimeMs: null,
			status: "error",
			errorMessage: errorMessage,
		});
	}

	/**
	 * Gets current billing period's API usage totals
	 * Queries logs within the current billing period window (based on reset timestamp)
	 * Falls back to calendar month for backward compatibility with old logs
	 * Used internally by checkBudget()
	 */
	async getCurrentBillingPeriodUsage(): Promise<{
		totalRequests: number;
		totalJobs: number;
	}> {
		const currentReset = await this.getCurrentBillingPeriodReset();
		const now = new Date();

		if (currentReset) {
			if (currentReset > now) {
				const result = await db
					.select({
						totalRequests: sql<number>`COALESCE(SUM(${apiUsageLogs.requestCount}), 0)`,
						totalJobs: sql<number>`COALESCE(SUM(${apiUsageLogs.jobsFetched}), 0)`,
					})
					.from(apiUsageLogs)
					.where(
						and(
							eq(apiUsageLogs.billingPeriodResetAt, currentReset),
							lt(apiUsageLogs.timestamp, currentReset),
						),
					);

				return {
					totalRequests: Number(result[0]?.totalRequests ?? 0),
					totalJobs: Number(result[0]?.totalJobs ?? 0),
				};
			}

			const result = await db
				.select({
					totalRequests: sql<number>`COALESCE(SUM(${apiUsageLogs.requestCount}), 0)`,
					totalJobs: sql<number>`COALESCE(SUM(${apiUsageLogs.jobsFetched}), 0)`,
				})
				.from(apiUsageLogs)
				.where(
					and(
						isNotNull(apiUsageLogs.billingPeriodResetAt),
						gte(apiUsageLogs.timestamp, currentReset),
					),
				);

			return {
				totalRequests: Number(result[0]?.totalRequests ?? 0),
				totalJobs: Number(result[0]?.totalJobs ?? 0),
			};
		}

		const result = await db
			.select({
				totalRequests: sql<number>`COALESCE(SUM(${apiUsageLogs.requestCount}), 0)`,
				totalJobs: sql<number>`COALESCE(SUM(${apiUsageLogs.jobsFetched}), 0)`,
			})
			.from(apiUsageLogs)
			.where(
				sql`DATE_TRUNC('month', ${apiUsageLogs.timestamp}) = DATE_TRUNC('month', CURRENT_DATE)`,
			);

		return {
			totalRequests: Number(result[0]?.totalRequests ?? 0),
			totalJobs: Number(result[0]?.totalJobs ?? 0),
		};
	}

	/**
	 * Gets current billing period's performance statistics
	 * Returns: Total usage + success rate + average response time
	 * Used by: Admin dashboard / monitoring
	 * Note: Queries all logs within the current billing period using time-based window
	 */
	async getUsageStats(): Promise<{
		totalRequests: number;
		totalJobs: number;
		successRate: number;
		avgResponseTime: number;
	}> {
		const currentReset = await this.getCurrentBillingPeriodReset();
		const now = new Date();

		const result =
			currentReset && currentReset > now
				? await (async () => {
						const periodDurationMs = 30 * 24 * 60 * 60 * 1000;
						const periodStart = new Date(
							currentReset.getTime() - periodDurationMs,
						);
						return db
							.select({
								totalRequests: sql<number>`COALESCE(SUM(${apiUsageLogs.requestCount}), 0)`,
								totalJobs: sql<number>`COALESCE(SUM(${apiUsageLogs.jobsFetched}), 0)`,
								successCount: sql<number>`COUNT(CASE WHEN ${apiUsageLogs.status} = 'success' THEN 1 END)`,
								totalCount: sql<number>`COUNT(*)`,
								avgResponseTime: sql<number>`COALESCE(AVG(${apiUsageLogs.responseTimeMs}), 0)`,
							})
							.from(apiUsageLogs)
							.where(
								and(
									gte(apiUsageLogs.timestamp, periodStart),
									lt(apiUsageLogs.timestamp, currentReset),
								),
							);
					})()
				: currentReset
					? await db
							.select({
								totalRequests: sql<number>`COALESCE(SUM(${apiUsageLogs.requestCount}), 0)`,
								totalJobs: sql<number>`COALESCE(SUM(${apiUsageLogs.jobsFetched}), 0)`,
								successCount: sql<number>`COUNT(CASE WHEN ${apiUsageLogs.status} = 'success' THEN 1 END)`,
								totalCount: sql<number>`COUNT(*)`,
								avgResponseTime: sql<number>`COALESCE(AVG(${apiUsageLogs.responseTimeMs}), 0)`,
							})
							.from(apiUsageLogs)
							.where(gte(apiUsageLogs.timestamp, currentReset))
					: await db
							.select({
								totalRequests: sql<number>`COALESCE(SUM(${apiUsageLogs.requestCount}), 0)`,
								totalJobs: sql<number>`COALESCE(SUM(${apiUsageLogs.jobsFetched}), 0)`,
								successCount: sql<number>`COUNT(CASE WHEN ${apiUsageLogs.status} = 'success' THEN 1 END)`,
								totalCount: sql<number>`COUNT(*)`,
								avgResponseTime: sql<number>`COALESCE(AVG(${apiUsageLogs.responseTimeMs}), 0)`,
							})
							.from(apiUsageLogs)
							.where(
								sql`DATE_TRUNC('month', ${apiUsageLogs.timestamp}) = DATE_TRUNC('month', CURRENT_DATE)`,
							);

		const stats = result[0];
		const totalCount = Number(stats?.totalCount ?? 0);
		const successCount = Number(stats?.successCount ?? 0);

		return {
			totalRequests: Number(stats?.totalRequests ?? 0),
			totalJobs: Number(stats?.totalJobs ?? 0),
			successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 0,
			avgResponseTime: Number(stats?.avgResponseTime ?? 0),
		};
	}

	/**
	 * Gets budget utilization with percentages
	 * Returns: Usage vs limits for both Requests and Jobs with % calculation
	 * Uses API headers as source of truth (calculates used = limit - remaining from API)
	 * Used by: Admin dashboard + budget warnings (triggers alert at 80%)
	 */
	async getBudgetUtilization(): Promise<{
		requests: { used: number; limit: number; percentage: number };
		jobs: { used: number; limit: number; percentage: number };
	}> {
		const rateLimitInfo = await this.getLatestRateLimitInfo();

		if (
			rateLimitInfo.jobsLimit &&
			rateLimitInfo.jobsRemaining !== null &&
			rateLimitInfo.requestsLimit &&
			rateLimitInfo.requestsRemaining !== null
		) {
			const jobsUsed = rateLimitInfo.jobsLimit - rateLimitInfo.jobsRemaining;
			const requestsUsed =
				rateLimitInfo.requestsLimit - rateLimitInfo.requestsRemaining;

			return {
				requests: {
					used: requestsUsed,
					limit: rateLimitInfo.requestsLimit,
					percentage: (requestsUsed / rateLimitInfo.requestsLimit) * 100,
				},
				jobs: {
					used: jobsUsed,
					limit: rateLimitInfo.jobsLimit,
					percentage: (jobsUsed / rateLimitInfo.jobsLimit) * 100,
				},
			};
		}

		const usage = await this.getCurrentBillingPeriodUsage();
		const limits = await this.getDynamicLimits();

		return {
			requests: {
				used: usage.totalRequests,
				limit: limits.requestsLimit,
				percentage: (usage.totalRequests / limits.requestsLimit) * 100,
			},
			jobs: {
				used: usage.totalJobs,
				limit: limits.jobsLimit,
				percentage: (usage.totalJobs / limits.jobsLimit) * 100,
			},
		};
	}

	/**
	 * Gets comprehensive billing period information
	 * Returns: Reset timestamp, time remaining, period status
	 */
	async getBillingPeriodInfo(): Promise<{
		resetAt: Date | null;
		secondsUntilReset: number | null;
		daysUntilReset: number | null;
		periodActive: boolean;
	}> {
		const currentReset = await this.getCurrentBillingPeriodReset();
		const now = new Date();

		if (!currentReset) {
			return {
				resetAt: null,
				secondsUntilReset: null,
				daysUntilReset: null,
				periodActive: false,
			};
		}

		const secondsUntilReset = Math.max(
			0,
			Math.floor((currentReset.getTime() - now.getTime()) / 1000),
		);
		const daysUntilReset = secondsUntilReset / (24 * 60 * 60);

		return {
			resetAt: currentReset,
			secondsUntilReset: currentReset > now ? secondsUntilReset : null,
			daysUntilReset:
				currentReset > now ? Math.round(daysUntilReset * 100) / 100 : null,
			periodActive: currentReset > now,
		};
	}

	/**
	 * Gets most recent API rate limit information from api_config
	 * Returns: Latest rate limit headers from successful API call (source of truth)
	 * Uses API's reported remaining credits directly, not calculated from our tracking
	 */
	async getLatestRateLimitInfo(): Promise<{
		jobsLimit: number | null;
		jobsRemaining: number | null;
		requestsLimit: number | null;
		requestsRemaining: number | null;
		lastUpdated: Date | null;
		endpoint: string | null;
	}> {
		const configResult = await db
			.select({
				jobsLimit: apiConfig.jobsLimit,
				jobsRemaining: apiConfig.jobsRemaining,
				requestsLimit: apiConfig.requestsLimit,
				requestsRemaining: apiConfig.requestsRemaining,
				updatedAt: apiConfig.updatedAt,
			})
			.from(apiConfig)
			.orderBy(apiConfig.id)
			.limit(1);

		const config = configResult[0];

		if (!config) {
			return {
				jobsLimit: null,
				jobsRemaining: null,
				requestsLimit: null,
				requestsRemaining: null,
				lastUpdated: null,
				endpoint: null,
			};
		}

		const lastLogResult = await db
			.select({
				endpoint: apiUsageLogs.endpoint,
			})
			.from(apiUsageLogs)
			.where(eq(apiUsageLogs.status, "success"))
			.orderBy(desc(apiUsageLogs.timestamp))
			.limit(1);

		return {
			jobsLimit: config.jobsLimit,
			jobsRemaining: config.jobsRemaining,
			requestsLimit: config.requestsLimit,
			requestsRemaining: config.requestsRemaining,
			lastUpdated: config.updatedAt,
			endpoint: lastLogResult[0]?.endpoint ?? null,
		};
	}

	/**
	 * Gets usage breakdown by endpoint
	 * Returns: Usage statistics per endpoint for current billing period
	 */
	async getUsageByEndpoint(): Promise<
		Array<{
			endpoint: string;
			requests: number;
			jobs: number;
			avgResponseTime: number;
			lastCalled: Date | null;
		}>
	> {
		const currentReset = await this.getCurrentBillingPeriodReset();
		const now = new Date();

		const result =
			currentReset && currentReset > now
				? await (async () => {
						const periodDurationMs = 30 * 24 * 60 * 60 * 1000;
						const periodStart = new Date(
							currentReset.getTime() - periodDurationMs,
						);
						return db
							.select({
								endpoint: apiUsageLogs.endpoint,
								totalRequests: sql<number>`COALESCE(SUM(${apiUsageLogs.requestCount}), 0)`,
								totalJobs: sql<number>`COALESCE(SUM(${apiUsageLogs.jobsFetched}), 0)`,
								avgResponseTime: sql<number>`COALESCE(AVG(${apiUsageLogs.responseTimeMs}), 0)`,
								lastCalled: sql<Date>`MAX(${apiUsageLogs.timestamp})`,
							})
							.from(apiUsageLogs)
							.where(
								and(
									gte(apiUsageLogs.timestamp, periodStart),
									lt(apiUsageLogs.timestamp, currentReset),
								),
							)
							.groupBy(apiUsageLogs.endpoint);
					})()
				: currentReset
					? await db
							.select({
								endpoint: apiUsageLogs.endpoint,
								totalRequests: sql<number>`COALESCE(SUM(${apiUsageLogs.requestCount}), 0)`,
								totalJobs: sql<number>`COALESCE(SUM(${apiUsageLogs.jobsFetched}), 0)`,
								avgResponseTime: sql<number>`COALESCE(AVG(${apiUsageLogs.responseTimeMs}), 0)`,
								lastCalled: sql<Date>`MAX(${apiUsageLogs.timestamp})`,
							})
							.from(apiUsageLogs)
							.where(gte(apiUsageLogs.timestamp, currentReset))
							.groupBy(apiUsageLogs.endpoint)
					: await db
							.select({
								endpoint: apiUsageLogs.endpoint,
								totalRequests: sql<number>`COALESCE(SUM(${apiUsageLogs.requestCount}), 0)`,
								totalJobs: sql<number>`COALESCE(SUM(${apiUsageLogs.jobsFetched}), 0)`,
								avgResponseTime: sql<number>`COALESCE(AVG(${apiUsageLogs.responseTimeMs}), 0)`,
								lastCalled: sql<Date>`MAX(${apiUsageLogs.timestamp})`,
							})
							.from(apiUsageLogs)
							.where(
								sql`DATE_TRUNC('month', ${apiUsageLogs.timestamp}) = DATE_TRUNC('month', CURRENT_DATE)`,
							)
							.groupBy(apiUsageLogs.endpoint);

		return result.map((row) => ({
			endpoint: row.endpoint,
			requests: Number(row.totalRequests),
			jobs: Number(row.totalJobs),
			avgResponseTime: Number(row.avgResponseTime),
			lastCalled: row.lastCalled,
		}));
	}

	/**
	 * Gets recent activity summary
	 * Returns: Last API call info and recent activity trends
	 */
	async getRecentActivity(): Promise<{
		lastApiCall: Date | null;
		lastSuccessfulCall: Date | null;
		callsToday: number;
		callsThisWeek: number;
		recentErrors: number;
	}> {
		const lastCall = await db
			.select({ timestamp: apiUsageLogs.timestamp })
			.from(apiUsageLogs)
			.orderBy(desc(apiUsageLogs.timestamp))
			.limit(1);

		const lastSuccess = await db
			.select({ timestamp: apiUsageLogs.timestamp })
			.from(apiUsageLogs)
			.where(eq(apiUsageLogs.status, "success"))
			.orderBy(desc(apiUsageLogs.timestamp))
			.limit(1);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);

		const callsTodayResult = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(apiUsageLogs)
			.where(gte(apiUsageLogs.timestamp, today));

		const callsThisWeekResult = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(apiUsageLogs)
			.where(gte(apiUsageLogs.timestamp, weekAgo));

		const recentErrorsResult = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(apiUsageLogs)
			.where(
				and(
					eq(apiUsageLogs.status, "error"),
					gte(apiUsageLogs.timestamp, weekAgo),
				),
			);

		return {
			lastApiCall: lastCall[0]?.timestamp ?? null,
			lastSuccessfulCall: lastSuccess[0]?.timestamp ?? null,
			callsToday: Number(callsTodayResult[0]?.count ?? 0),
			callsThisWeek: Number(callsThisWeekResult[0]?.count ?? 0),
			recentErrors: Number(recentErrorsResult[0]?.count ?? 0),
		};
	}

	/**
	 * Gets comprehensive dashboard data
	 * Returns: All relevant information for admin monitoring
	 */
	async getDashboardData(): Promise<{
		budgetStatus: {
			requests: {
				used: number;
				limit: number;
				percentage: number;
				remaining: number;
			};
			jobs: {
				used: number;
				limit: number;
				percentage: number;
				remaining: number;
			};
		};
		billingPeriod: {
			resetAt: Date | null;
			secondsUntilReset: number | null;
			daysUntilReset: number | null;
			periodActive: boolean;
		};
		rateLimitInfo: {
			jobsLimit: number | null;
			jobsRemaining: number | null;
			requestsLimit: number | null;
			requestsRemaining: number | null;
			lastUpdated: Date | null;
			endpoint: string | null;
		};
		stats: {
			totalRequests: number;
			totalJobs: number;
			successRate: number;
			avgResponseTime: number;
		};
		usageByEndpoint: Array<{
			endpoint: string;
			requests: number;
			jobs: number;
			avgResponseTime: number;
			lastCalled: Date | null;
		}>;
		recentActivity: {
			lastApiCall: Date | null;
			lastSuccessfulCall: Date | null;
			callsToday: number;
			callsThisWeek: number;
			recentErrors: number;
		};
	}> {
		const [
			budgetStatus,
			billingPeriod,
			rateLimitInfo,
			stats,
			usageByEndpoint,
			recentActivity,
		] = await Promise.all([
			this.getBudgetUtilization(),
			this.getBillingPeriodInfo(),
			this.getLatestRateLimitInfo(),
			this.getUsageStats(),
			this.getUsageByEndpoint(),
			this.getRecentActivity(),
		]);

		return {
			budgetStatus: {
				requests: {
					...budgetStatus.requests,
					remaining: budgetStatus.requests.limit - budgetStatus.requests.used,
				},
				jobs: {
					...budgetStatus.jobs,
					remaining: budgetStatus.jobs.limit - budgetStatus.jobs.used,
				},
			},
			billingPeriod,
			rateLimitInfo,
			stats,
			usageByEndpoint,
			recentActivity,
		};
	}
}

export const usageTracker = new UsageTracker();
