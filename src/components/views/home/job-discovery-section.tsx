import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TitleWrapper } from "@/wrappers";
import Image from "next/image";
import alertImage from "public/assets/home/alert.svg";
import crwalImage from "public/assets/home/crwal.svg";
import filterImage from "public/assets/home/filter.svg";
import surfaceImage from "public/assets/home/surface.svg";

export const JobDiscoverySection = () => {
	return (
		<TitleWrapper
			title="Automated job discovery, delivered fresh every day."
			para="We track thousands of hiring sources in real time so you only see fresh, active, verified roles."
			className="pb-content-lg"
			titleClasses="max-w-para!"
			id="features"
		>
			<Card className="overflow-hidden rounded-xl border border-border bg-background p-0">
				<div className="grid border-collapse md:grid-cols-2">
					{[
						{
							title: "We crawl everywhere",
							description:
								"Our advanced web scraping technology pulls job listings from company career pages, startup hiring tools, and platforms like Ashby, Greenhouse, Lever, Workable, Recruitee, Teamtailor, and dozens more. We monitor over 50,000 sources daily to ensure comprehensive coverage.",
							tag: "Continuous coverage",
							hasGradient: false,
							image: crwalImage,
						},
						{
							title: "We filter, dedupe & verify",
							description:
								"Our intelligent system uses machine learning to remove duplicates, spam, expired listings, and fake job posts. We verify company information, check posting dates, and ensure only real, active roles make it to your feed. Quality over quantity, always.",
							tag: "Trust & precision",
							hasGradient: false,
							image: filterImage,
						},
						{
							title: "We surface what's new",
							description:
								"Every 24 hours at midnight EST, we publish fresh job listings discovered in the past day. Our algorithm prioritizes recently posted roles and removes stale listings. You get to see what's new today — not what's been sitting around for weeks.",
							tag: "Fresh first",
							hasGradient: true,
							image: surfaceImage,
						},
						{
							title: "You get alerts or browse on demand",
							description:
								"Free users can access 2 jobs per day and browse categories. Pro users get unlimited browsing, personalized email alerts based on saved searches, advanced filters by location/salary/remote status, and priority access to exclusive listings from our partner companies.",
							tag: "Free alerts + Pro tools",
							hasGradient: false,
							image: alertImage,
						},
					].map((item, i) => (
						<div
							key={item.title}
							className={cn(
								"border-border p-6",
								i < 2 && "md:border-b",
								i % 2 === 0 && "md:border-r",
							)}
						>
							<CardContent className="flex h-full flex-col justify-between space-y-6 p-0">
								<div>
									<div className="relative h-56 w-full bg-muted">
										{item.hasGradient && (
											<div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />
										)}
										<Image
											src={item.image}
											alt={item.title}
											className="h-full w-full object-cover"
											width={100}
											height={100}
										/>
									</div>
									<h3 className="mt-6 mb-2 font-bold text-heading-h4">
										{item.title}
									</h3>
									<p className="text-[15px] text-muted-foreground">
										{item.description}
									</p>
								</div>
								{item.tag && (
									<span className="self-start rounded-sm border border-border bg-muted px-3 py-1.5 font-medium text-foreground text-sm">
										{item.tag}
									</span>
								)}
							</CardContent>
						</div>
					))}
				</div>
			</Card>
		</TitleWrapper>
	);
};
