import { Resend } from "resend";

import { env } from "@/env";
import { LoopsClient } from "loops";

export const loops = new LoopsClient(env.LOOPS_API_KEY);
export const resend = new Resend(env.RESEND_API_KEY);

export function createRedirectUrl(params: {
	path?: string;
	error?: boolean;
	message?: string;
	success?: boolean;
	[key: string]: string | boolean | undefined;
}): string {
	const url = new URL(params.path ?? env.NEXT_PUBLIC_HOST_URL);

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			url.searchParams.append(key, String(value));
		}
	}
	return url.toString();
}

/**
 * Extracts client IP address from request headers
 * Handles various proxy headers (Railway, Cloudflare, etc.)
 */
export function getClientIP(headers: Headers): string | null {
	// Check Cloudflare header
	const cfIP = headers.get("cf-connecting-ip");
	if (cfIP) {
		return cfIP;
	}

	// Check standard forwarded headers
	const forwardedFor = headers.get("x-forwarded-for");
	if (forwardedFor) {
		// x-forwarded-for can contain multiple IPs, take the first one
		return forwardedFor.split(",")[0]?.trim() || null;
	}

	const realIP = headers.get("x-real-ip");
	if (realIP) {
		return realIP;
	}

	return null;
}

/**
 * Gets country name from IP address using ipapi.co
 * @param headers - Request headers from Next.js
 * @returns Country name or null if unable to determine
 */
export async function getCountryFromIP(
	headers: Headers,
): Promise<string | null> {
	// Extract IP address
	const ip = getClientIP(headers);
	if (!ip) {
		return null;
	}

	// Skip localhost/private IPs
	const isLocalhost =
		ip === "127.0.0.1" ||
		ip === "::1" ||
		ip.startsWith("192.168.") ||
		ip.startsWith("10.") ||
		ip.startsWith("172.16.") ||
		ip.startsWith("172.17.") ||
		ip.startsWith("172.18.") ||
		ip.startsWith("172.19.") ||
		ip.startsWith("172.20.") ||
		ip.startsWith("172.21.") ||
		ip.startsWith("172.22.") ||
		ip.startsWith("172.23.") ||
		ip.startsWith("172.24.") ||
		ip.startsWith("172.25.") ||
		ip.startsWith("172.26.") ||
		ip.startsWith("172.27.") ||
		ip.startsWith("172.28.") ||
		ip.startsWith("172.29.") ||
		ip.startsWith("172.30.") ||
		ip.startsWith("172.31.");

	if (isLocalhost) {
		return null;
	}

	return await getCountryFromTestIP(ip);
}

/**
 * Helper function to get country name from an IP address using ipapi.co
 */
async function getCountryFromTestIP(ip: string): Promise<string | null> {
	try {
		// Use ipapi.co free tier (1,000 requests/day, no API key needed for country)
		const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
			headers: {
				"User-Agent": "InternshipsHQ/1.0",
			},
			// Add timeout to prevent hanging
			signal: AbortSignal.timeout(3000),
		});

		if (!response.ok) {
			return null;
		}

		const countryName = (await response.text()).trim();
		return countryName || null;
	} catch (error) {
		// Silently fail - don't block page rendering
		console.error("Failed to get country from IP:", error);
		return null;
	}
}

/**
 * Ensures a contact exists in Loops, creating or updating as needed
 */
export async function ensureLoopsContact(
	email: string,
	properties?: {
		firstName?: string;
		lastName?: string;
		[key: string]: string | number | boolean | null | undefined;
	},
): Promise<void> {
	try {
		// Try to find the contact first
		const existingContact = await loops.findContact({ email });

		if (existingContact && existingContact.length > 0) {
			// Contact exists, update it
			if (properties) {
				await loops.updateContact({
					email,
					properties: {
						firstName: properties.firstName ?? "",
						lastName: properties.lastName ?? "",
					},
					mailingLists: {
						cmia6kl1s4cyl0i1xh8nk51e5: true,
					},
				});
			}
			console.log("Contact updated");
		} else {
			await loops.createContact({
				email: email,
				properties: {
					firstName: properties?.firstName ?? "",
					lastName: properties?.lastName ?? "",
				},
				mailingLists: {
					cmia6kl1s4cyl0i1xh8nk51e5: true,
				},
			});
			console.log("Contact created");
		}
	} catch (error) {
		console.error("Error ensuring Loops contact:", error);
	}
}
