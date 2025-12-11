import { env } from "@/env";
import type {
	FetchJobsOptionsI,
	RapidAPIErrorI,
	RapidAPIJobI,
	RapidAPIRateLimitHeadersI,
	RapidAPIResponseWithHeadersI,
} from "./types";

/**
 * RapidAPI Client
 * Handles all HTTP requests to RapidAPI Active Jobs DB
 * Includes timeout handling, rate limit parsing, and error handling
 */
export class RapidAPIClient {
	private readonly timeout = 30000;
	private readonly baseURL = `https://${env.RAPID_API_HOST}`;
	private readonly headers = {
		"x-rapidapi-host": env.RAPID_API_HOST,
		"X-RapidAPI-Key": env.RAPID_API_KEY,
		"Content-Type": "application/json",
	};

	/**
	 * Wrapper for fetch with 30-second timeout
	 * Aborts request if it takes longer than timeout period
	 */
	private async fetchWithTimeout(
		url: string,
		options: RequestInit,
	): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});
			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				throw this.createError("Request timeout", 408, url);
			}
			throw error;
		}
	}

	/**
	 * Creates standardized error object for API failures
	 */
	private createError(
		message: string,
		statusCode: number,
		endpoint: string,
	): RapidAPIErrorI {
		return {
			message,
			statusCode,
			endpoint,
		};
	}

	/**
	 * Converts parameter object to URL query string
	 * Filters out undefined/null values
	 */
	private buildQueryString(
		params: Record<string, string | number | boolean>,
	): string {
		const searchParams = new URLSearchParams();
		// biome-ignore lint/complexity/noForEach: <explanation>
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, String(value));
			}
		});
		return searchParams.toString();
	}

	/**
	 * Extracts rate limit information from response headers
	 * Returns current usage and limits for requests and jobs
	 */
	private parseRateLimitHeaders(response: Response): RapidAPIRateLimitHeadersI {
		return {
			jobsLimit: Number(response.headers.get("x-ratelimit-jobs-limit") || 0),
			jobsRemaining: Number(
				response.headers.get("x-ratelimit-jobs-remaining") || 0,
			),
			requestsLimit: Number(
				response.headers.get("x-ratelimit-requests-limit") || 0,
			),
			requestsRemaining: Number(
				response.headers.get("x-ratelimit-requests-remaining") || 0,
			),
			resetTime: Number(response.headers.get("x-ratelimit-jobs-reset") || 0),
		};
	}

	/**
	 * Fetches jobs posted in the last hour (firehose endpoint)
	 * Returns: Job data + rate limit headers
	 * Counts towards: Requests AND Jobs budget
	 */
	async fetchHourlyJobs(
		options: FetchJobsOptionsI = {},
	): Promise<RapidAPIResponseWithHeadersI<RapidAPIJobI[]>> {
		const {
			limit = 100,
			offset = 0,
			title_filter,
			location_filter,
			include_ai = true,
			include_li = true,
			description_type = "html",
			ai_employment_type_filter = "INTERN",
			source = "adp,applicantpro,ashby,bamboohr,breezy,careerplug,comeet,csod, dayforce,eightfold,freshteam,gem,greenhouse,gohire,hirehive, hiringthing,icims,isolved,jazzhr,jobvite,join.com,kula,lever.co, oraclecloud,paycom,paylocity,personio,phenompeople,pinpoint,polymer, recruitee,recooty,smartrecruiters,successfactors,taleo,teamtailor, trakstar,workable,workday,zoho",
		} = options;

		const params: Record<string, string | number | boolean> = {
			limit,
			offset,
			include_ai: include_ai ? "true" : "false",
			include_li: include_li ? "true" : "false",
			source,
			description_type,
			ai_employment_type_filter,
		};

		if (title_filter) params.title_filter = title_filter;
		if (location_filter) params.location_filter = location_filter;

		const queryString = this.buildQueryString(params);
		const url = `${this.baseURL}/active-ats-1h?${queryString}`;

		try {
			const response = await this.fetchWithTimeout(url, {
				method: "GET",
				headers: this.headers,
			});

			if (!response.ok) {
				throw this.createError(
					`API request failed: ${response.statusText}`,
					response.status,
					"/active-ats-1h",
				);
			}

			const data = (await response.json()) as RapidAPIJobI[];
			const rateLimit = this.parseRateLimitHeaders(response);

			return { data, rateLimit };
		} catch (error) {
			if ((error as RapidAPIErrorI).endpoint) {
				throw error;
			}
			throw this.createError(
				error instanceof Error ? error.message : "Unknown error",
				500,
				"/active-ats-1h",
			);
		}
	}

	/**
	 * Fetches jobs posted in the last 24 hours
	 * Returns: Job data + rate limit headers
	 * Counts towards: Requests AND Jobs budget
	 */
	async fetchDailyJobs(
		options: FetchJobsOptionsI = {},
	): Promise<RapidAPIResponseWithHeadersI<RapidAPIJobI[]>> {
		const {
			limit = 100,
			offset,
			title_filter,
			location_filter,
			include_ai = true,
			include_li = true,
			description_type = "html",
			ai_employment_type_filter = "INTERN",
			source = "adp,applicantpro,ashby,bamboohr,breezy,careerplug,comeet,csod, dayforce,eightfold,freshteam,gem,greenhouse,gohire,hirehive, hiringthing,icims,isolved,jazzhr,jobvite,join.com,kula,lever.co, oraclecloud,paycom,paylocity,personio,phenompeople,pinpoint,polymer, recruitee,recooty,smartrecruiters,successfactors,taleo,teamtailor, trakstar,workable,workday,zoho",
		} = options;

		const params: Record<string, string | number | boolean> = {
			limit,
			offset: offset ?? 0,
			include_ai: include_ai ? "true" : "false",
			include_li: include_li ? "true" : "false",
			source,
			description_type,
			ai_employment_type_filter,
		};

		if (title_filter) params.title_filter = title_filter;
		if (location_filter) params.location_filter = location_filter;

		const queryString = this.buildQueryString(params);
		const url = `${this.baseURL}/active-ats-24h?${queryString}`;

		try {
			const response = await this.fetchWithTimeout(url, {
				method: "GET",
				headers: this.headers,
			});

			if (!response.ok) {
				throw this.createError(
					`API request failed: ${response.statusText}`,
					response.status,
					"/active-ats-24h",
				);
			}

			const data = (await response.json()) as RapidAPIJobI[];
			const rateLimit = this.parseRateLimitHeaders(response);

			return { data, rateLimit };
		} catch (error) {
			if ((error as RapidAPIErrorI).endpoint) {
				throw error;
			}
			throw this.createError(
				error instanceof Error ? error.message : "Unknown error",
				500,
				"/active-ats-24h",
			);
		}
	}

	/**
	 * Fetches jobs that were modified in the last 24 hours
	 * Returns: Job data + rate limit headers
	 * Counts towards: Requests ONLY (NOT Jobs budget)
	 */
	async fetchModifiedJobs(
		limit = 500,
		offset = 0,
	): Promise<RapidAPIResponseWithHeadersI<RapidAPIJobI[]>> {
		const params = {
			limit,
			offset,
			include_ai: "true",
			include_li: "true",
			description_type: "html",
			ai_employment_type_filter: "INTERN",
		};

		const queryString = this.buildQueryString(params);
		const url = `${this.baseURL}/modified-ats-24h?${queryString}`;

		try {
			const response = await this.fetchWithTimeout(url, {
				method: "GET",
				headers: this.headers,
			});

			if (!response.ok) {
				throw this.createError(
					`API request failed: ${response.statusText}`,
					response.status,
					"/modified-ats",
				);
			}

			const data = (await response.json()) as RapidAPIJobI[];
			const rateLimit = this.parseRateLimitHeaders(response);

			return { data, rateLimit };
		} catch (error) {
			if ((error as RapidAPIErrorI).endpoint) {
				throw error;
			}
			throw this.createError(
				error instanceof Error ? error.message : "Unknown error",
				500,
				"/modified-ats",
			);
		}
	}

	/**
	 * Fetches daily jobs with automatic pagination
	 * Makes multiple API calls with offset until targetJobs is reached or end of data
	 * Returns: Aggregated job data + rate limit headers from last call
	 * Counts towards: Requests AND Jobs budget
	 */
	async fetchDailyJobsPaginated(
		targetJobs: number,
		options: FetchJobsOptionsI = {},
	): Promise<RapidAPIResponseWithHeadersI<RapidAPIJobI[]>> {
		const limit = 100;
		const allJobs: RapidAPIJobI[] = [];
		let lastRateLimit: RapidAPIRateLimitHeadersI | undefined;
		let totalRequests = 0;

		while (allJobs.length < targetJobs) {
			try {
				const response = await this.fetchDailyJobs({
					...options,
					offset: totalRequests * 100,
				});

				allJobs.push(...response.data);
				lastRateLimit = response.rateLimit;
				totalRequests++;

				if (response.data.length < limit) {
					break;
				}

				if (allJobs.length >= targetJobs) {
					break;
				}
			} catch (error) {
				if (allJobs.length > 0) {
					return {
						data: allJobs.slice(0, targetJobs),
						rateLimit: lastRateLimit ?? ({} as RapidAPIRateLimitHeadersI),
					};
				}
				throw error;
			}
		}

		return {
			data: allJobs,
			rateLimit: lastRateLimit ?? ({} as RapidAPIRateLimitHeadersI),
		};
	}

	/**
	 * Fetches modified jobs with automatic pagination
	 * Note: Modified endpoint typically returns up to 500 jobs per call
	 * If targetJobs > 500, makes multiple calls (if API supports offset)
	 * Returns: Aggregated job data + rate limit headers from last call
	 * Counts towards: Requests ONLY (NOT Jobs budget)
	 */
	async fetchModifiedJobsPaginated(
		targetJobs: number,
	): Promise<RapidAPIJobI[]> {
		const limit = 500;
		const allJobs: RapidAPIJobI[] = [];
		const totalRequests = 0;

		while (allJobs.length < targetJobs) {
			try {
				const response = await this.fetchModifiedJobs(
					limit,
					totalRequests * limit,
				);
				allJobs.push(...response.data);

				if (response.data.length < limit) {
					break;
				}

				if (allJobs.length >= targetJobs) {
					break;
				}
			} catch (error) {
				if (allJobs.length > 0) {
					return allJobs;
				}
				throw error;
			}
		}

		return allJobs;
	}

	/**
	 * Fetches IDs of jobs that expired yesterday
	 * Returns: Array of job IDs (not full job objects) + rate limit headers
	 * Counts towards: Requests ONLY (NOT Jobs budget)
	 */
	async fetchExpiredJobs(): Promise<number[]> {
		const url = `${this.baseURL}/active-ats-expired`;

		try {
			const response = await this.fetchWithTimeout(url, {
				method: "GET",
				headers: this.headers,
			});

			if (!response.ok) {
				throw this.createError(
					`API request failed: ${response.statusText}`,
					response.status,
					"/active-ats-expired",
				);
			}

			const data = (await response.json()) as number[];
			return data;
		} catch (error) {
			if ((error as RapidAPIErrorI).endpoint) {
				throw error;
			}
			throw this.createError(
				error instanceof Error ? error.message : "Unknown error",
				500,
				"/active-ats-expired",
			);
		}
	}
}

export const rapidAPIClient = new RapidAPIClient();
