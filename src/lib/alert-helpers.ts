import type { JobCardI, JobI } from "@/lib/types";

interface AlertData {
	name: string;
	locations?: string[];
	categories?: string[];
	remoteOnly?: boolean;
}

/**
 * Derives alert data from a job object for "similar jobs" alerts.
 * This creates a broader filter by using the job's key attributes.
 */
export function deriveAlertFromJob(job: JobCardI): AlertData {
	// Create a descriptive name based on the job
	const nameComponents: string[] = [];

	if (job.aiTaxonomiesA && job.aiTaxonomiesA.length > 0) {
		nameComponents.push(job.aiTaxonomiesA[0] ?? "");
	} else if (job.title) {
		// Fallback to first significant word from title
		const titleWords = job.title.split(" ");
		const significantWord = titleWords.find(
			(word) =>
				word.length > 3 && !["and", "the", "for"].includes(word.toLowerCase()),
		);
		if (significantWord) {
			nameComponents.push(significantWord);
		}
	}

	nameComponents.push("Internships");
	const name = nameComponents.join(" ");

	// Extract location (simplified, using location string)
	const locations = job.citiesDerived ? job.citiesDerived : undefined;

	// Extract categories (using ai_taxonomies_a)
	const categories =
		job.aiTaxonomiesA && job.aiTaxonomiesA.length > 0
			? job.aiTaxonomiesA
			: undefined;

	// Remote preference
	const remoteOnly = job.remoteDerived ? true : undefined;

	return {
		name,
		locations,
		categories,
		remoteOnly,
	};
}
