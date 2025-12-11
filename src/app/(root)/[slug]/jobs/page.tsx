import { BottomCta } from "@/common/bottom-cta";
import { JobListingSection } from "@/components/common/job-listing-section";
import type { FilterFormValues } from "@/components/common/job-listing-section";
import { PageWrapper, Wrapper } from "@/components/wrappers";
import { staticPages } from "@/config/static-pages";
import { getCountryFromIP } from "@/lib/serverUtils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const slug = (await params).slug;
	const page = staticPages[slug as keyof typeof staticPages];

	return {
		title: {
			default: `${page.title} - Fresh, Verified Openings Updated Every Minute | InternshipsHQ`,
			template: "%s",
		},
		description: `Find fresh ${page.title}  updated every minute. InternshipsHQ scans thousands of hiring sources to surface real, verified openings before most job seekers ever see them.`,
		metadataBase: new URL(
			`${process.env.NEXT_PUBLIC_HOST_URL}/${slug}/jobs` || "",
		),
		alternates: {
			canonical: `${process.env.NEXT_PUBLIC_HOST_URL}/${slug}/jobs`,
		},
	};
}

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const slug = (await params).slug;
	const page = Object.keys(staticPages).find((page) => page === slug);

	if (!page) {
		return redirect("/not-found");
	}

	const { title, filters } = staticPages[page as keyof typeof staticPages];

	// If this is the "jobs-in-demand-in-your-country" page, detect user's country
	let finalFilters: Partial<FilterFormValues> = {
		...filters,
		// Convert undefined values to actual undefined for proper typing
		remote: filters.remote ?? undefined,
		location: filters.location ?? undefined,
		searchQuery: filters.searchQuery ?? undefined,
		categories: filters.categories ?? undefined,
	};

	if (slug === "jobs-in-demand-in-your-country") {
		try {
			const headersList = await headers();
			const country = await getCountryFromIP(headersList);

			if (country) {
				finalFilters = {
					...finalFilters,
					location: country,
				};
			}
		} catch (error) {
			// Silently fail - use original filters if country detection fails
			console.error("Failed to detect country:", error);
		}
	}

	return (
		<PageWrapper>
			<Wrapper className="border-lines">
				<JobListingSection
					className="pt-content"
					initialFilters={finalFilters}
					title={title}
					withCategories={false}
				/>
				<BottomCta />
			</Wrapper>
		</PageWrapper>
	);
}
