import { env } from "@/env";
import { type Auth, google } from "googleapis";

/**
 * Google Job Indexing API Client
 * Batch-only implementation using HTTP batch requests
 *
 * Requirements:
 * - Service Account with Indexing API enabled
 * - Domain verified in Google Search Console
 * - Jobs must have valid JobPosting structured data on the page
 */
export class GoogleJobIndexingClient {
	private auth: Auth.GoogleAuth;

	constructor() {
		try {
			if (!env.GOOGLE_SERVICE_ACCOUNT_KEY) {
				throw new Error(
					"GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set",
				);
			}

			const serviceAccountKey = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_KEY);
			this.auth = new google.auth.GoogleAuth({
				credentials: serviceAccountKey,
				scopes: ["https://www.googleapis.com/auth/indexing"],
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			console.error("Failed to initialize Google Indexing API:", errorMessage);
			throw new Error(
				`Google Indexing API initialization failed: ${errorMessage}`,
			);
		}
	}

	/**
	 * Get OAuth2 access token for batch requests
	 */
	private async getAccessToken(): Promise<string> {
		const client = await this.auth.getClient();
		const tokenResponse = await client.getAccessToken();
		if (!tokenResponse.token) {
			throw new Error("Failed to get access token");
		}
		return tokenResponse.token;
	}

	/**
	 * Build multipart/mixed request body for batch API
	 *
	 * Format required by Google's batch API specification:
	 * - Each part is a complete HTTP request (method, path, headers, body)
	 * - Boundaries separate parts (standard multipart/mixed format)
	 * - Content-ID maps responses back to requests
	 */
	private buildMultipartBody(
		requests: Array<{ url: string; type: "URL_UPDATED" | "URL_DELETED" }>,
		boundary: string,
	): string {
		const parts = requests.map((request, index) => {
			const requestBody = JSON.stringify({
				url: request.url,
				type: request.type,
			});

			// Each part contains a complete HTTP request
			return [
				`--${boundary}`,
				"Content-Type: application/http",
				"Content-Transfer-Encoding: binary",
				`Content-ID: <item${index + 1}>`,
				"", // Empty line before HTTP request
				"POST /v3/urlNotifications:publish HTTP/1.1",
				"Content-Type: application/json",
				"", // Empty line before body
				requestBody,
			].join("\r\n");
		});

		// Join all parts and add closing boundary
		return `${parts.join("\r\n")}\r\n--${boundary}--`;
	}

	/**
	 * Parse multipart/mixed response from batch API
	 */
	private parseMultipartResponse(
		responseText: string,
		boundary: string,
	): Array<{ success: boolean; error?: string }> {
		const results: Array<{ success: boolean; error?: string }> = [];
		const parts = responseText.split(`--${boundary}`);

		for (const part of parts) {
			if (!part.trim() || part.trim() === "--") continue;

			// Extract HTTP response from part
			const httpMatch = part.match(/HTTP\/1\.1\s+(\d+)/);
			if (!httpMatch?.[1]) continue;

			const statusCode = Number.parseInt(httpMatch[1], 10);

			// Extract JSON body
			const jsonMatch = part.match(/\r\n\r\n({[\s\S]*})/);
			if (jsonMatch?.[1]) {
				try {
					const jsonBody = JSON.parse(jsonMatch[1]) as {
						error?: { message?: string };
					};
					if (statusCode >= 200 && statusCode < 300) {
						results.push({ success: true });
					} else {
						results.push({
							success: false,
							error: jsonBody.error?.message || `HTTP ${statusCode}`,
						});
					}
				} catch {
					results.push({
						success: false,
						error: `Failed to parse response: HTTP ${statusCode}`,
					});
				}
			} else {
				results.push({
					success: statusCode >= 200 && statusCode < 300,
					error: statusCode >= 300 ? `HTTP ${statusCode}` : undefined,
				});
			}
		}

		return results;
	}

	/**
	 * Batch submit multiple job URLs to Google Indexing API
	 * Uses HTTP batch requests (multipart/mixed) for efficiency
	 * @param requests - Array of {url, type} objects (max 100 per batch)
	 * @returns Array of results matching input order
	 */
	async batchSubmitJobs(
		requests: Array<{ url: string; type: "URL_UPDATED" | "URL_DELETED" }>,
	): Promise<Array<{ success: boolean; error?: string }>> {
		if (requests.length === 0) {
			return [];
		}

		if (requests.length > 100) {
			throw new Error(
				"Batch size exceeds Google's limit of 100 requests per batch",
			);
		}

		try {
			const accessToken = await this.getAccessToken();
			const boundary = `===============${Date.now()}==`;
			const body = this.buildMultipartBody(requests, boundary);

			const response = await fetch("https://indexing.googleapis.com/batch", {
				method: "POST",
				headers: {
					"Content-Type": `multipart/mixed; boundary="${boundary}"`,
					Authorization: `Bearer ${accessToken}`,
				},
				body,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Batch request failed: HTTP ${response.status} - ${errorText}`,
				);
			}

			const responseText = await response.text();

			// Extract boundary from response Content-Type header if present
			const contentType = response.headers.get("content-type");
			const responseBoundary =
				contentType?.match(/boundary="?([^";\s]+)"?/)?.[1] || boundary;

			const results = this.parseMultipartResponse(
				responseText,
				responseBoundary,
			);

			// Ensure we return results for all requests (handle parsing errors)
			while (results.length < requests.length) {
				results.push({
					success: false,
					error: "Response parsing error",
				});
			}

			return results.slice(0, requests.length);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			console.error("Google batch indexing error:", errorMessage);

			// Return failure for all requests if batch fails
			return requests.map(() => ({
				success: false,
				error: errorMessage,
			}));
		}
	}
}

// Singleton instance
export const googleJobIndexing = new GoogleJobIndexingClient();
