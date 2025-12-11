import { env } from "@/env";
import { googleJobIndexing } from "@/lib/google-job-indexing";
import { logsnag } from "@/lib/logsnag";
import { db } from "@/server/db";
import { jobs } from "@/server/db/schema";
import { and, eq, or, sql } from "drizzle-orm";

/**
 * Google Job Indexing Service
 * Batch-only implementation for indexing and removing jobs from Google
 *
 * Flow:
 * 1. Query database for jobs needing indexing/removal
 * 2. Build job URLs
 * 3. Batch submit to Google Indexing API (up to 100 per batch)
 * 4. Update database with indexing status
 * 5. Log results
 */
export class GoogleIndexingService {
	private readonly baseUrl = env.NEXT_PUBLIC_HOST_URL;

	/**
	 * Batch index jobs that need indexing
	 * Finds jobs where: isExpired = false AND (googleIndexed = false OR updatedAt > googleIndexedAt)
	 * @param limit - Maximum number of jobs to process (default: 100)
	 */
	async batchIndexPendingJobs(limit = 1): Promise<{
		processed: number;
		successful: number;
		failed: number;
		errors: Array<{ jobId: string; error: string }>;
	}> {
		try {
			// Find jobs that need indexing
			const pendingJobs = await db
				.select({ id: jobs.id })
				.from(jobs)
				.where(
					and(
						eq(jobs.isExpired, false),
						or(
							eq(jobs.googleIndexed, false),
							sql`${jobs.updatedAt} > ${jobs.googleIndexedAt}`,
							sql`${jobs.googleIndexedAt} IS NULL`,
						),
					),
				)
				.limit(limit);

			if (pendingJobs.length === 0) {
				return {
					processed: 0,
					successful: 0,
					failed: 0,
					errors: [],
				};
			}

			// Build job URLs
			const requests = pendingJobs.map((job) => ({
				jobId: job.id,
				url: `${this.baseUrl}/jobs/public/${job.id}`,
				type: "URL_UPDATED" as const,
			}));

			// Submit batch to Google
			const batchResults = await googleJobIndexing.batchSubmitJobs(
				requests.map((r) => ({ url: r.url, type: r.type })),
			);

			// Process results and update database
			const results = {
				processed: pendingJobs.length,
				successful: 0,
				failed: 0,
				errors: [] as Array<{ jobId: string; error: string }>,
			};

			for (let i = 0; i < requests.length; i++) {
				const request = requests[i];
				const result = batchResults[i];

				if (!request || !result) {
					results.failed++;
					results.errors.push({
						jobId: request?.jobId || "unknown",
						error: "Missing request or result",
					});
					continue;
				}

				if (result.success) {
					// Update database - success
					await db
						.update(jobs)
						.set({
							googleIndexed: true,
							googleIndexedAt: new Date(),
							googleIndexingStatus: "indexed",
							googleIndexingError: null,
						})
						.where(eq(jobs.id, request.jobId));

					results.successful++;
				} else {
					// Update database - failure
					await db
						.update(jobs)
						.set({
							googleIndexingStatus: "failed",
							googleIndexingError: result.error || "Unknown error",
						})
						.where(eq(jobs.id, request.jobId));

					results.failed++;
					results.errors.push({
						jobId: request.jobId,
						error: result.error || "Unknown error",
					});
				}
			}

			// Log to LogSnag
			await logsnag.log({
				channel: "jobs",
				event: "Google Batch Indexing",
				description: `Processed ${results.processed} jobs: ${results.successful} successful, ${results.failed} failed`,
				tags: {
					processed: results.processed,
					successful: results.successful,
					failed: results.failed,
					errors: JSON.stringify(results.errors, null, 2),
				},
			});

			return results;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			console.error("Google batch indexing error:", errorMessage);

			await logsnag.log({
				channel: "errors",
				event: "Google Batch Indexing Failed",
				description: `Batch indexing failed: ${errorMessage}`,
				tags: { error: errorMessage },
			});

			return {
				processed: 0,
				successful: 0,
				failed: 0,
				errors: [{ jobId: "N/A", error: errorMessage }],
			};
		}
	}

	/**
	 * Batch remove expired jobs from Google index
	 * Finds jobs where: isExpired = true AND googleIndexed = true
	 * @param limit - Maximum number of jobs to process (default: 100)
	 */
	async batchRemoveExpiredJobs(limit = 100): Promise<{
		processed: number;
		successful: number;
		failed: number;
		errors: Array<{ jobId: string; error: string }>;
	}> {
		try {
			// Find expired jobs that are indexed
			const expiredJobs = await db
				.select({ id: jobs.id })
				.from(jobs)
				.where(and(eq(jobs.isExpired, true), eq(jobs.googleIndexed, true)))
				.limit(limit);

			if (expiredJobs.length === 0) {
				return {
					processed: 0,
					successful: 0,
					failed: 0,
					errors: [],
				};
			}

			// Build job URLs
			const requests = expiredJobs.map((job) => ({
				jobId: job.id,
				url: `${this.baseUrl}/jobs/public/${job.id}`,
				type: "URL_DELETED" as const,
			}));

			// Submit batch to Google
			const batchResults = await googleJobIndexing.batchSubmitJobs(
				requests.map((r) => ({ url: r.url, type: r.type })),
			);

			// Process results and update database
			const results = {
				processed: expiredJobs.length,
				successful: 0,
				failed: 0,
				errors: [] as Array<{ jobId: string; error: string }>,
			};

			for (let i = 0; i < requests.length; i++) {
				const request = requests[i];
				const result = batchResults[i];

				if (!request || !result) {
					results.failed++;
					results.errors.push({
						jobId: request?.jobId || "unknown",
						error: "Missing request or result",
					});
					continue;
				}

				if (result.success) {
					// Update database - success
					await db
						.update(jobs)
						.set({
							googleIndexed: false,
							googleIndexingStatus: "expired",
							googleIndexingError: null,
						})
						.where(eq(jobs.id, request.jobId));

					results.successful++;
				} else {
					// Update database - failure
					await db
						.update(jobs)
						.set({
							googleIndexingStatus: "failed",
							googleIndexingError: result.error || "Unknown error",
						})
						.where(eq(jobs.id, request.jobId));

					results.failed++;
					results.errors.push({
						jobId: request.jobId,
						error: result.error || "Unknown error",
					});
				}
			}

			// Log to LogSnag
			await logsnag.log({
				channel: "jobs",
				event: "Google Batch Removal",
				description: `Processed ${results.processed} expired jobs: ${results.successful} removed, ${results.failed} failed`,
				tags: {
					processed: results.processed,
					successful: results.successful,
					failed: results.failed,
					errors: JSON.stringify(results.errors, null, 2),
				},
			});

			return results;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			console.error("Google batch removal error:", errorMessage);

			await logsnag.log({
				channel: "errors",
				event: "Google Batch Removal Failed",
				description: `Batch removal failed: ${errorMessage}`,
				tags: { error: errorMessage },
			});

			return {
				processed: 0,
				successful: 0,
				failed: 0,
				errors: [{ jobId: "N/A", error: errorMessage }],
			};
		}
	}
}

export const googleIndexingService = new GoogleIndexingService();
