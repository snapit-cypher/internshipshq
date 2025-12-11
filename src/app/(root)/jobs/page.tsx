import { BottomCta } from "@/common/bottom-cta";
import { JobListingSection } from "@/components/common/job-listing-section";
import { PageWrapper, Wrapper } from "@/components/wrappers";
import { HydrateClient, api } from "@/trpc/server";

export default async function Page() {
	void api.jobs.getJobs.prefetch({
		page: 1,
		limit: 15,
		filters: {},
	});

	return (
		<PageWrapper>
			<Wrapper className="border-lines">
				<HydrateClient>
					<JobListingSection className="pt-content" />
				</HydrateClient>
				<BottomCta />
			</Wrapper>
		</PageWrapper>
	);
}
