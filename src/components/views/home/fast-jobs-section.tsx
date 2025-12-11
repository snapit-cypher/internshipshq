import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TitleWrapper } from "@/wrappers";
import {
	ClockIcon,
	DatabaseIcon,
	FilterIcon,
	InboxIcon,
	ShieldCheckIcon,
	ZapIcon,
} from "lucide-react";

export const FastJobsSection = () => {
	return (
		<TitleWrapper
			title="See the jobs most people won’t see and see them first"
			className="pb-content-lg"
		>
			<div className="relative grid overflow-hidden border md:grid-cols-2 lg:grid-cols-3">
				{[
					{
						icon: ClockIcon,
						title: "Real-Time Job Refresh",
						description:
							"We update listings every few minutes so you always see roles that are actually hiring now. No expired posts, no ghost jobs, no week-old listings clogging your search.",
						tag: "Always fresh",
					},
					{
						icon: DatabaseIcon,
						title: "Multi-Source Aggregation",
						description:
							"We monitor LinkedIn, Indeed, Glassdoor, startup job boards, and thousands of company career pages to surface the widest range of opportunities in one place.",
						tag: "Wide coverage",
					},
					{
						icon: FilterIcon,
						title: "Smart Filtering & Cleanup",
						description:
							"Our system automatically removes duplicates, spam, fake listings, and outdated roles. You only browse clean, verified, high-quality job posts.",
						tag: "Precision filtering",
					},

					{
						icon: InboxIcon,
						title: "Instant Job Alerts for Free",
						description:
							"Get notified the moment a new role that fits your interests goes live. Real-time alerts help you apply early and beat the crowd.",
						tag: "Free alerts",
					},
					{
						icon: ZapIcon,
						title: "Personalized Search Tools",
						description:
							"Use advanced filters for location, experience level, salary, remote status, and more. Save searches to get instant alerts tailored exactly to your goals.",
						tag: "Made for your search",
					},
					{
						icon: ShieldCheckIcon,
						title: "Verified Opportunities",
						description:
							"Every job is checked for legitimacy and active status so you don’t waste time on dead ends. Apply confidently knowing we screen out low-quality or misleading posts.",
						tag: "Quality guaranteed",
					},
				].map((feature, index) => {
					const totalItems = 6;
					const colsMd = 2;
					const colsLg = 3;

					const isLastColumnMd = (index + 1) % colsMd === 0;
					const isLastColumnLg = (index + 1) % colsLg === 0;
					const isLastRowMd = index >= totalItems - colsMd;
					const isLastRowLg = index >= totalItems - colsLg;
					const Icon = feature.icon;

					return (
						<Card
							key={feature.title}
							className={cn(
								"flex h-full flex-col rounded-none border-0",
								!isLastColumnMd && "md:border-r",
								!isLastColumnLg && "lg:border-r",
								isLastColumnLg && "lg:border-r-0",
								!isLastRowMd && "md:border-b",
								!isLastRowLg && "lg:border-b",
								isLastRowLg && "lg:border-b-0",
								index < totalItems - colsLg && "border-b",
							)}
						>
							<CardContent className="flex flex-1 flex-col space-y-4">
								<Icon className="h-6 w-6 text-foreground" />
								<div className="space-y-2">
									<h3 className="font-semibold text-heading-h4">
										{feature.title}
									</h3>
									<p
										className="text-muted-foreground"
										style={{ fontSize: "15px" }}
									>
										{feature.description}
									</p>
								</div>
								<span className="mt-auto self-start rounded-sm border border-border bg-white px-3 py-1.5 font-medium text-foreground text-sm">
									{feature.tag}
								</span>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</TitleWrapper>
	);
};
