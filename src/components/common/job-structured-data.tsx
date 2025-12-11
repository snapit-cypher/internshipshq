import { env } from "@/env";
import type { JobI } from "@/lib/types";
import Script from "next/script";

/**
 * JobPosting Structured Data Component
 * Generates JSON-LD structured data for Google Job Indexing
 * Must match Google's JobPosting schema requirements exactly
 *
 * Reference: https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */
export function JobStructuredData({ job }: { job: JobI }) {
	const baseUrl = env.NEXT_PUBLIC_HOST_URL;
	const jobUrl = `${baseUrl}/jobs/public/${job.id}`;

	// Format datePosted as YYYY-MM-DD (Google requirement)
	const formatDatePosted = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	// Format validThrough as ISO string (Google requirement: YYYY-MM-DDTHH:mm)
	const formatValidThrough = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}T00:00`;
	};

	// Build jobLocation - Google requires a single Place object (not array)
	// Use first location from locationsRaw, or create default for remote jobs
	const jobLocations = job.locationsRaw || [];
	let jobLocation: {
		"@type": "Place";
		address: {
			"@type": "PostalAddress";
			streetAddress?: string;
			addressLocality?: string;
			addressRegion?: string;
			postalCode?: string;
			addressCountry: string;
		};
	};

	if (jobLocations.length > 0 && jobLocations[0]?.address) {
		const firstLoc = jobLocations[0].address;
		jobLocation = {
			"@type": "Place",
			address: {
				"@type": "PostalAddress",
				streetAddress: firstLoc.streetAddress,
				addressLocality: firstLoc.addressLocality,
				addressRegion: firstLoc.addressRegion,
				postalCode: firstLoc.postalCode,
				addressCountry: firstLoc.addressCountry || "US",
			},
		};
	} else if (job.remoteDerived) {
		// For remote jobs, use country from countriesDerived
		jobLocation = {
			"@type": "Place",
			address: {
				"@type": "PostalAddress",
				addressCountry: job.countriesDerived?.[0] || "US",
			},
		};
	} else {
		// Fallback: use first city/country if available
		jobLocation = {
			"@type": "Place",
			address: {
				"@type": "PostalAddress",
				addressLocality: job.citiesDerived?.[0],
				addressCountry: job.countriesDerived?.[0] || "US",
			},
		};
	}

	// Build base salary - Google supports both single value and range
	// Using range format (minValue/maxValue) as we have both values
	const baseSalary =
		job.aiSalaryMinvalue && job.aiSalaryMaxvalue
			? {
					"@type": "MonetaryAmount",
					currency: job.aiSalaryCurrency || "USD",
					value: {
						"@type": "QuantitativeValue",
						minValue: job.aiSalaryMinvalue,
						maxValue: job.aiSalaryMaxvalue,
						unitText: job.aiSalaryUnittext || "YEAR",
					},
				}
			: job.aiSalaryValue
				? {
						"@type": "MonetaryAmount",
						currency: job.aiSalaryCurrency || "USD",
						value: {
							"@type": "QuantitativeValue",
							value: job.aiSalaryValue,
							unitText: job.aiSalaryUnittext || "YEAR",
						},
					}
				: undefined;

	// Build employment type - map to Google's expected values
	const employmentTypeMap: Record<string, string> = {
		"Full-time": "FULL_TIME",
		"Part-time": "PART_TIME",
		Contract: "CONTRACTOR",
		Contractor: "CONTRACTOR",
		Internship: "INTERN",
		Temporary: "TEMPORARY",
		Volunteer: "VOLUNTEER",
	};

	const rawEmploymentType =
		job.employmentType?.[0] || job.aiEmploymentType?.[0] || "Full-time";
	const employmentType = employmentTypeMap[rawEmploymentType] || "FULL_TIME";

	// Build hiring organization
	const hiringOrganization: {
		"@type": "Organization";
		name: string;
		sameAs?: string;
		logo?: string;
	} = {
		"@type": "Organization",
		name: job.organization,
	};

	if (job.organizationUrl) {
		hiringOrganization.sameAs = job.organizationUrl;
	}

	if (job.organizationLogo) {
		hiringOrganization.logo = job.organizationLogo;
	}

	// Clean description - remove HTML tags but preserve content
	const cleanDescription =
		job.descriptionText || job.descriptionHtml?.replace(/<[^>]*>/g, "") || "";

	// Build job posting structured data matching Google's exact format
	const jobPosting: {
		"@context": string;
		"@type": string;
		title: string;
		description: string;
		identifier: {
			"@type": string;
			name: string;
			value: string;
		};
		datePosted: string;
		validThrough?: string;
		employmentType: string;
		hiringOrganization: typeof hiringOrganization;
		jobLocation: typeof jobLocation;
		baseSalary?: typeof baseSalary;
		url?: string;
	} = {
		"@context": "https://schema.org/",
		"@type": "JobPosting",
		title: job.title,
		description: cleanDescription,
		identifier: {
			"@type": "PropertyValue",
			name: job.organization,
			value: job.id,
		},
		datePosted: formatDatePosted(job.datePosted),
		employmentType,
		hiringOrganization,
		jobLocation,
		url: jobUrl,
	};

	// Add validThrough if available
	if (job.dateValidthrough) {
		jobPosting.validThrough = formatValidThrough(job.dateValidthrough);
	}

	// Add base salary if available
	if (baseSalary) {
		jobPosting.baseSalary = baseSalary;
	}

	return (
		<Script
			id="job-structured-data"
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPosting) }}
		/>
	);
}
