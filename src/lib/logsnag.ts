import { env } from "@/env";

/**
 * LogSnag Client
 * Sends events and notifications to LogSnag for monitoring and debugging
 * Channels: jobs, budget, sync, errors
 * Never throws - failures are logged to console to avoid breaking main process
 */
export class LogSnagClient {
	private readonly apiKey = env.LOGSNAG_API_TOKEN;
	private readonly project = env.LOGSNAG_PROJECT;
	private readonly baseURL = "https://api.logsnag.com/v1";

	/**
	 * Base log method - sends event to LogSnag
	 * Used internally by helper methods
	 * Fails silently if LogSnag API is unavailable
	 */
	async log(event: {
		channel: string;
		event: string;
		description: string;
		icon?: string;
		notify?: boolean;
		tags?: Record<string, string | number>;
	}): Promise<void> {
		try {
			await fetch(`${this.baseURL}/log`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					project: this.project,
					channel: event.channel,
					event: event.event,
					description: event.description,
					icon: event.icon,
					notify: event.notify ?? false,
					tags: event.tags,
				}),
			});
		} catch (error) {
			console.error("LogSnag error:", error);
		}
	}

	/**
	 * Logs successful job sync event
	 * Called after each successful API sync
	 * Channel: jobs
	 */
	async jobsSynced(
		processed: number,
		source: string,
		skipped: number,
		options?: {
			responseTime?: number;
			totalJobs?: number;
			endpoint?: string;
		},
	): Promise<void> {
		const responseTimeText = options?.responseTime
			? ` Total response time: ${options.responseTime}ms.`
			: "";
		const totalJobsText = options?.totalJobs
			? ` Database now contains ${options.totalJobs.toLocaleString()} active jobs.`
			: "";
		const skippedText =
			skipped > 0
				? ` ${skipped} jobs were skipped (duplicates or invalid data).`
				: "";

		await this.log({
			channel: "jobs",
			event: "Jobs Synced",
			description: `Successfully synced ${processed} jobs from ${source} endpoint.${skippedText}${responseTimeText}${totalJobsText}`,
			icon: "📥",
			notify: false,
			tags: {
				source,
				processed,
				skipped,
				...(options?.responseTime && { responseTime: options.responseTime }),
				...(options?.totalJobs && { totalJobs: options.totalJobs }),
				...(options?.endpoint && { endpoint: options.endpoint }),
				timestamp: new Date().toISOString(),
			},
		});
	}

	/**
	 * Sends budget warning notification
	 * Triggered when usage exceeds 80% of limit
	 * Channel: budget | notify: true
	 */
	async budgetWarning(
		usage: number,
		limit: number,
		type: "requests" | "jobs",
		options?: {
			daysUntilReset?: number;
			resetAt?: Date | null;
		},
	): Promise<void> {
		const percentage = (usage / limit) * 100;
		const remaining = limit - usage;
		const daysText = options?.daysUntilReset
			? ` Billing period resets in ${options.daysUntilReset} days.`
			: "";
		const resetText = options?.resetAt
			? ` Period resets on ${options.resetAt.toISOString().split("T")[0]}.`
			: "";
		const recommendation =
			percentage >= 90
				? " Consider reducing sync frequency immediately to avoid hitting the limit."
				: percentage >= 80
					? " Consider reducing sync frequency if approaching limit."
					: "";

		await this.log({
			channel: "jobs",
			event: "Budget Warning",
			description: `API ${type} usage has reached ${percentage.toFixed(1)}% (${usage.toLocaleString()}/${limit.toLocaleString()}). ${remaining.toLocaleString()} ${type} remaining.${daysText}${resetText}${recommendation}`,
			icon: "⚠️",
			notify: true,
			tags: {
				type,
				used: usage,
				limit,
				remaining,
				percentage: Math.round(percentage),
				...(options?.daysUntilReset && {
					daysUntilReset: Math.round(options.daysUntilReset),
				}),
				...(options?.resetAt && { resetAt: options.resetAt.toISOString() }),
			},
		});
	}

	/**
	 * Sends critical budget exceeded alert
	 * Blocks further API calls until next month
	 * Channel: budget | notify: true
	 */
	async budgetExceeded(
		type: "requests" | "jobs",
		options?: {
			used?: number;
			limit?: number;
			resetAt?: Date | null;
			daysUntilReset?: number;
		},
	): Promise<void> {
		const usedText =
			options?.used && options?.limit
				? ` (${options.used.toLocaleString()}/${options.limit.toLocaleString()})`
				: "";
		const resetText = options?.resetAt
			? ` Billing period resets on ${options.resetAt.toISOString().split("T")[0]}.`
			: "";
		const daysText = options?.daysUntilReset
			? ` ${Math.round(options.daysUntilReset)} days until reset.`
			: "";

		await this.log({
			channel: "jobs",
			event: "Budget Exceeded",
			description: `CRITICAL: API ${type} budget exceeded${usedText}. All sync operations paused until billing period resets.${resetText}${daysText} Manual intervention required or wait for period reset.`,
			icon: "🚫",
			notify: true,
			tags: {
				type,
				...(options?.used && { used: options.used }),
				...(options?.limit && { limit: options.limit }),
				...(options?.resetAt && { resetAt: options.resetAt.toISOString() }),
				...(options?.daysUntilReset && {
					daysUntilReset: Math.round(options.daysUntilReset),
				}),
			},
		});
	}

	/**
	 * Logs API sync failure
	 * Channel: errors | notify: true
	 */
	async syncError(
		endpoint: string,
		error: string,
		context?: {
			statusCode?: number;
			responseTime?: number;
			errors?: Array<{ jobId: string; error: string }>;
			[key: string]: string | number | string[] | object | undefined;
		},
	): Promise<void> {
		const statusText = context?.statusCode
			? ` Status code: ${context.statusCode}.`
			: "";
		const responseTimeText = context?.responseTime
			? ` Response time: ${context.responseTime}ms.`
			: "";
		const errorsText =
			context?.errors &&
			Array.isArray(context.errors) &&
			context.errors.length > 0
				? ` ${context.errors.length} individual job processing errors occurred.`
				: "";
		const timestamp = new Date().toISOString();
		const retryText =
			" Check API status and retry manually if needed. Review error details in tags for investigation.";

		await this.log({
			channel: "errors",
			event: "Sync Error",
			description: `Failed to sync ${endpoint}: ${error}.${statusText}${responseTimeText}${errorsText} This occurred at ${timestamp}.${retryText}`,
			icon: "❌",
			notify: true,
			tags: {
				endpoint,
				error: error.substring(0, 200),
				...(context?.statusCode && { statusCode: context.statusCode }),
				...(context?.responseTime && { responseTime: context.responseTime }),
				...(context?.errors &&
					Array.isArray(context.errors) && {
						errorCount: context.errors.length,
						errors: JSON.stringify(context.errors.slice(0, 10)),
					}),
				timestamp,
			},
		});
	}

	async expiredJobsMarked(
		count: number,
		options?: {
			activeJobs?: number;
			totalJobs?: number;
		},
	): Promise<void> {
		const activeText = options?.activeJobs
			? ` Database now has ${options.activeJobs.toLocaleString()} active jobs remaining.`
			: "";
		const totalText = options?.totalJobs
			? ` Total jobs in database: ${options.totalJobs.toLocaleString()}.`
			: "";
		const timestamp = new Date().toISOString();

		await this.log({
			channel: "jobs",
			event: "Jobs Expired",
			description: `Marked ${count.toLocaleString()} jobs as expired from yesterday's expired jobs list.${activeText}${totalText} Expired jobs are soft-deleted (is_expired=true) and will not appear in job listings.`,
			icon: "🗑️",
			notify: false,
			tags: {
				count,
				...(options?.activeJobs && { activeJobs: options.activeJobs }),
				...(options?.totalJobs && { totalJobs: options.totalJobs }),
				timestamp,
			},
		});
	}

	/**
	 * Logs partial sync success for pagination scenarios
	 * Used when some pagination calls succeed and some fail
	 * Channel: jobs | notify: true (if failures occurred)
	 */
	async syncPartialSuccess(
		endpoint: string,
		successfulCalls: number,
		totalCalls: number,
		totalJobsProcessed: number,
		failedCalls: number,
	): Promise<void> {
		const successRate = (successfulCalls / totalCalls) * 100;
		const isPartialFailure = failedCalls > 0;

		await this.log({
			channel: "jobs",
			event: "Partial Sync Success",
			description: `Partial sync success for ${endpoint}. ${successfulCalls}/${totalCalls} pagination calls succeeded (${successRate.toFixed(1)}% success rate). ${totalJobsProcessed.toLocaleString()} jobs processed successfully.${isPartialFailure ? ` ${failedCalls} pagination call(s) failed. Check logs for details.` : ""}`,
			icon: isPartialFailure ? "⚠️" : "📥",
			notify: isPartialFailure,
			tags: {
				endpoint,
				successfulCalls,
				totalCalls,
				totalJobsProcessed,
				failedCalls,
				successRate: Math.round(successRate),
				timestamp: new Date().toISOString(),
			},
		});
	}

	async error(
		message: string,
		context?: Record<string, string | number>,
	): Promise<void> {
		await this.log({
			channel: "errors",
			event: "Error",
			description: message,
			icon: "❌",
			notify: true,
			tags: context,
		});
	}
}

export const logsnag = new LogSnagClient();
