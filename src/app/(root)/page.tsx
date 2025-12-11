import { BottomCta } from "@/common/bottom-cta";
import { CompaniesSection } from "@/common/companies-section";
import { FrequentlyAskedQuestions } from "@/common/frequently-asked-questions";
import { JobListingSection } from "@/common/job-listing-section";
import { NewsletterForm } from "@/common/newsletter-form";
import { Testimonials } from "@/common/testimonials";
import { getCountryFromIP } from "@/lib/serverUtils";
import { CuratedJobsSection } from "@/views/home/curated-jobs-section";
import { FastJobsSection } from "@/views/home/fast-jobs-section";
import { GlobalReachSection } from "@/views/home/global-reach-section";
import { Hero } from "@/views/home/hero";
import { InternshipGuideSection } from "@/views/home/internship-guide-section";
import { JobDiscoverySection } from "@/views/home/job-discovery-section";
import { PageWrapper, Wrapper } from "@/wrappers";
import { headers } from "next/headers";

export default async function Page() {
	let country = "your Country";
	try {
		const headersList = await headers();
		country = (await getCountryFromIP(headersList)) ?? "your Country";
	} catch (error) {
		console.error("Failed to detect country:", error);
	}

	return (
		<PageWrapper>
			<Wrapper className="border-lines">
				<Hero />
			</Wrapper>
			<Wrapper className="border-lines">
				<InternshipGuideSection
					steps={[
						{
							number: 1,
							title: "Identify the Goal",
							description: "Define your target and strategy.",
							strategyLinks: [
								{
									label:
										"Identify Your Target Company before applying internship",
									url: "https://internshipshq.com/blog/identify-your-target-company-before-applying-internship",
								},
								{
									label: "How to Choose the Right Internship?",
									url: "https://internshipshq.com/blog/how-to-choose-the-right-internship",
								},
							],
						},
						{
							number: 2,
							title: "Build the Foundation",
							description: "Prepare your materials and online presence.",
							strategyLinks: [
								{
									label: "Create a compelling resume",
									url: "https://internshipshq.com/blog/create-a-compelling-resume",
								},
								{
									label: "Build your LinkedIn profile",
									url: "https://internshipshq.com/blog/build-your-linkedin-profile",
								},
								{
									label: "Prepare your portfolio",
									url: "https://internshipshq.com/blog/prepare-your-portfolio",
								},
							],
						},
						{
							number: 3,
							title: "Take Action",
							description: "Apply, network, and connect.",
							strategyLinks: [
								{
									label: "Find internship opportunities",
									url: "https://internshipshq.com/blog/find-internship-opportunities",
								},
								{
									label: "Network with professionals",
									url: "https://internshipshq.com/blog/network-with-professionals",
								},
								{
									label: "Submit applications strategically",
									url: "https://internshipshq.com/blog/submit-applications-strategically",
								},
							],
						},
						{
							number: 4,
							title: "Show Yourself",
							description: "Ace the interview and follow up.",
							strategyLinks: [
								{
									label: "Prepare for common interview questions",
									url: "https://internshipshq.com/blog/prepare-for-common-interview-questions",
								},
								{
									label: "Follow up after interviews",
									url: "https://internshipshq.com/blog/follow-up-after-interviews",
								},
								{
									label: "Negotiate your offer",
									url: "https://internshipshq.com/blog/negotiate-your-offer",
								},
							],
						},
					]}
				/>
			</Wrapper>
			<div className="border-lines border-y-2">
				<Wrapper className="border-lines">
					<CompaniesSection />
				</Wrapper>
			</div>
			<Wrapper className="border-lines">
				<NewsletterForm />
				<JobListingSection withPagination={false} withFilters={false} />
				<CuratedJobsSection country={country} />
				<JobDiscoverySection />
				<FastJobsSection />
				<GlobalReachSection />
				<Testimonials />
				<FrequentlyAskedQuestions />
				<BottomCta />
			</Wrapper>
		</PageWrapper>
	);
}
