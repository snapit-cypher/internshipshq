import type { FilterFormValues } from "@/components/common/job-listing-section";
import type { JobCardI, JobCategoryT } from "@/lib/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const FreeViewLimit = 30;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getTimeCategory(datePosted: string | Date): string {
	const now = new Date();
	const posted = new Date(datePosted);
	const diffHours = Math.abs(now.getTime() - posted.getTime()) / 36e5;

	if (diffHours <= 4) return "LAST 4 HOURS";
	if (diffHours <= 12) return "LAST 12 HOURS";
	if (diffHours <= 24) return "LAST 24 HOURS";
	if (diffHours <= 48) return "LAST 2 DAYS";
	if (diffHours <= 168) return "LAST WEEK";
	return "OLDER";
}

export function groupJobsByTime(jobs: JobCardI[]): Map<string, JobCardI[]> {
	const grouped = new Map<string, JobCardI[]>();
	const categories = [
		"LAST 4 HOURS",
		"LAST 12 HOURS",
		"LAST 24 HOURS",
		"LAST 2 DAYS",
		"LAST WEEK",
		"OLDER",
	];

	// Initialize all categories
	for (const cat of categories) {
		grouped.set(cat, []);
	}

	// Group jobs
	for (const job of jobs) {
		const category = getTimeCategory(job.datePosted);
		grouped.get(category)?.push(job);
	}

	// Remove empty categories
	for (const [key, value] of grouped.entries()) {
		if (value.length === 0) {
			grouped.delete(key);
		}
	}

	return grouped;
}

export function parseFiltersFromURL(
	searchParams: URLSearchParams,
): Partial<FilterFormValues> {
	const categoriesParam = searchParams.get("categories");
	const categories = categoriesParam
		? categoriesParam
				.split(",")
				.filter(Boolean)
				.map((c) => decodeURIComponent(c))
		: undefined;

	return {
		searchQuery: searchParams.get("search") || undefined,
		location: searchParams.get("location") || undefined,
		remote: searchParams.get("remote") === "true" || undefined,
		categories: categories && categories.length > 0 ? categories : undefined,
	};
}

export function buildURLParams(
	filters: FilterFormValues,
	page: number,
): URLSearchParams {
	const params = new URLSearchParams();
	if (filters.searchQuery) params.set("search", filters.searchQuery);
	if (filters.location) params.set("location", filters.location);
	if (filters.remote) params.set("remote", "true");
	if (filters.categories && filters.categories.length > 0) {
		params.set(
			"categories",
			filters.categories.map((c) => encodeURIComponent(c)).join(","),
		);
	}
	if (page > 1) params.set("page", String(page));
	return params;
}

export const getTodayUTC = (): string => {
	const now = new Date();
	return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
};

export const formatDate = (date: string | Date): string => {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export const getInitials = (nameOrEmail: string) => {
	if (!nameOrEmail) return "U";
	const str = nameOrEmail.trim();
	if (!str) return "U";
	const parts = str.split(/[\s@._-]+/).filter(Boolean);
	const first = parts[0]?.[0];
	const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
	return (first ?? "U") + (last ?? "");
};

export const formatBlogDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export const getBlogExcerpt = (post: {
	custom_excerpt?: string;
	excerpt?: string;
}) => {
	return post.custom_excerpt ?? post.excerpt ?? "";
};

export const getBlogAuthorName = (post: {
	primary_author?: { name?: string };
	authors?: Array<{ name?: string }>;
}) => {
	return (
		post.primary_author?.name ?? post.authors?.[0]?.name ?? "Unknown Author"
	);
};

export const getBlogAuthorImage = (post: {
	primary_author?: { profile_image?: string };
	authors?: Array<{ profile_image?: string }>;
}) => {
	return post.primary_author?.profile_image ?? post.authors?.[0]?.profile_image;
};

export const getBlogAuthorBio = (post: {
	primary_author?: { bio?: string };
	authors?: Array<{ bio?: string }>;
}) => {
	return post.primary_author?.bio ?? post.authors?.[0]?.bio ?? "";
};

export const getReadingTime = (html: string) => {
	const textContent = html.replace(/<[^>]*>/g, "");
	const wordCount = textContent.split(/\s+/).length;
	return Math.ceil(wordCount / 200);
};

export const decodeHtmlEntities = (html: string) => {
	if (!html || typeof html !== "string") return "";
	if (typeof document === "undefined") return html;

	const textarea = document.createElement("textarea");
	textarea.innerHTML = html;
	return textarea.value;
};

export const cleanAndDecodeHtml = (rawHtml: string) => {
	if (!rawHtml || typeof rawHtml !== "string") return "";

	let cleaned = rawHtml.trim();

	// 1. Strip surrounding quotes (if present, like " or ').
	// This addresses the issue where the content is a JSON-encoded string literal.
	if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
		cleaned = cleaned.slice(1, -1);
	} else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
		cleaned = cleaned.slice(1, -1);
	}

	// 2. Decode the string once to handle the outer encoding (e.g., &amp; -> &)
	let decoded = decodeHtmlEntities(cleaned);

	// 3. Decode the result a second time to handle the inner HTML tags (e.g., &lt; -> <)
	// This addresses the common issue of double-encoding.
	decoded = decodeHtmlEntities(decoded);

	return decoded;
};

export const cleanString = (str: string) => {
	if (!str || typeof str !== "string") return "";
	return str.replace(/[_-]/g, " ");
};

export const getJobInfoItems = (job: JobCardI) => {
	const location =
		job.citiesDerived?.[0] ??
		job.countriesDerived?.[0] ??
		(job.remoteDerived ? "Remote" : "Not specified");

	const experienceLevel = job.aiExperienceLevel ?? "Not specified";
	const employmentType =
		job.employmentType && job.employmentType.length > 0
			? job.employmentType[0]
			: "Full Time";

	const salary =
		job.aiSalaryMinvalue && job.aiSalaryMaxvalue
			? `${new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: job.aiSalaryCurrency ?? "USD",
					maximumFractionDigits: 0,
				}).format(job.aiSalaryMinvalue)} - ${new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: job.aiSalaryCurrency ?? "USD",
					maximumFractionDigits: 0,
				}).format(job.aiSalaryMaxvalue)}`
			: null;

	const workingHours = job.aiWorkingHours
		? `${job.aiWorkingHours} hours`
		: "Not specified";
	const jobLanguage = job.aiJobLanguage ?? "Not specified";
	const visaSponsorship = job.aiVisaSponsorship ? "Yes" : "No";
	const coreResponsibilities = job.aiCoreResponsibilities ?? "";
	const companySize = job.linkedinOrgEmployees ?? "Not specified";

	return {
		location,
		experienceLevel,
		employmentType,
		salary,
		workingHours,
		jobLanguage,
		visaSponsorship,
		coreResponsibilities,
		companySize,
	};
};

export const getDailyCounts = (): { hourly: number; daily: number } => {
	if (typeof window === "undefined") {
		// Fallback for SSR
		return { hourly: 30, daily: 30 };
	}

	const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
	const storageKey = `internshipshq-daily-count-${today}`;

	try {
		const stored = localStorage.getItem(storageKey);
		if (stored) {
			const parsed = JSON.parse(stored);
			// Verify the stored date matches today
			if (parsed.date === today) {
				return { hourly: parsed.hourly, daily: parsed.daily };
			}
		}

		// Generate new numbers for today
		const hourly = Math.floor(Math.random() * (45 - 22 + 1) + 22);
		const daily = Math.floor(Math.random() * (45 - 22 + 1) + 22);

		// Store in localStorage
		localStorage.setItem(
			storageKey,
			JSON.stringify({ hourly, daily, date: today }),
		);

		return { hourly, daily };
	} catch (error) {
		// Fallback if localStorage fails
		console.error("Failed to access localStorage:", error);
		return { hourly: 30, daily: 30 };
	}
};

/**
 * Reorders static category pages based on dynamic job counts
 * @param staticPages - Array of static page entries from siteConfig
 * @param dynamicCategories - Array of categories with counts from database
 * @returns Reordered array of static pages sorted by job count (descending)
 */
export function reorderCategoriesByCount<
	T extends {
		label: string;
		link: string;
		type: string;
		badge: string | null;
		disabled: boolean;
	},
>(staticPages: T[], dynamicCategories: JobCategoryT[]): T[] {
	// Create a map of category name to count for quick lookup
	const countMap = new Map<string, number>();
	for (const cat of dynamicCategories) {
		countMap.set(cat.category, cat.count);
	}

	// Create a map of category name to static page entry
	// We need to extract the category name from the static page structure
	// The category name is typically in the label (e.g., "Software Jobs" -> "Software")
	const categoryToPageMap = new Map<string, T>();
	for (const page of staticPages) {
		// Extract category name by removing " Jobs" suffix if present
		// Also try exact match first, then normalized match
		const categoryName = page.label.replace(/\s+Jobs$/, "").trim();
		categoryToPageMap.set(categoryName, page);
		// Also add exact label match for cases where label doesn't have " Jobs"
		if (categoryName !== page.label) {
			categoryToPageMap.set(page.label, page);
		}
	}

	// Sort dynamic categories by count (already sorted, but ensure)
	const sortedCategories = [...dynamicCategories].sort(
		(a, b) => b.count - a.count,
	);

	// Build reordered array based on dynamic counts
	const reordered: T[] = [];
	const usedPages = new Set<T>();

	// First, add pages that match dynamic categories (in count order)
	for (const dynamicCat of sortedCategories) {
		const page = categoryToPageMap.get(dynamicCat.category);
		if (page && !usedPages.has(page)) {
			reordered.push(page);
			usedPages.add(page);
		}
	}

	// Then, add any remaining static pages that weren't matched (in original order)
	for (const page of staticPages) {
		if (!usedPages.has(page)) {
			reordered.push(page);
		}
	}

	return reordered;
}
