import Image from "next/image";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TitleWrapper } from "@/wrappers";
import commasIcon from "public/icons/inverted-commas.svg";

export const Testimonials = () => {
	return (
		<TitleWrapper
			title="Trusted by new grads & job seekers everywhere."
			className="pb-content-lg"
			titleClasses="max-w-para!"
		>
			<div className="grid border md:grid-cols-2 lg:grid-cols-3">
				{[
					{
						quote:
							"Found roles I’ve literally never seen on LinkedIn or Indeed. Not exaggerating but some of the jobs here were pulled directly from company career pages I didn’t even know existed. As someone switching careers, that made a huge difference. Applied early, got callbacks fast.",
						author: "Chloe Hurtado",
						title: "Marketing Operations Associate @Coach",
					},
					{
						quote:
							"The email alerts are absurdly fast. I don’t normally write reviews, but InternshipsHQ deserves it. I’ve been getting job alerts before the roles show up anywhere else. I applied to one within 10 minutes of it going live and actually landed the interview.",
						author: "Mark Abbott",
						title: "Product Support Specialist @Grammarly",
					},
					{
						quote:
							"This is the only job site where the listings weren’t weeks old. I’m so tired of clicking into roles that were posted a month ago. InternshipsHQ was the first place where everything I opened was actually fresh. I got two interviews within a week because I finally wasn’t wasting time on dead listings - or worse, ghost jobs.",
						author: "Priya Warrier",
						title: "Product Designer @Figma",
					},
					{
						quote:
							"I got an offer from a job that wasn’t even on other boards yet.” A friend sent me a link from InternshipsHQ and I swear the role wasn’t on any other job site for at least a day. That early window is the only reason I got in before applications stacked up.",
						author: "Patryk Klusek",
						title: "IT Support Analyst @Airtable",
					},
					{
						quote:
							"If you’re not using this, someone else is seeing the job before you. I was skeptical at first, but after a week it was obvious: the people who apply early win. InternshipsHQ keeps you ahead of everyone who’s still refreshing LinkedIn hoping for something new.",
						author: "Jins Joy",
						title: "Data Associate @Deel",
					},
					{
						quote:
							"This site is the reason I didn’t miss the role I eventually landed. I had notifications on for a similar job elsewhere, but InternshipsHQ emailed me hours earlier. By the time it hit the big boards, it already had dozens of applicants. I’m honestly just glad I saw it when I did.",
						author: "Andrew Feng",
						title: "Customer Success Coordinator @Proxify",
					},
				].map((testimonial, index) => {
					const totalItems = 6;
					const colsMd = 2;
					const colsLg = 3;

					const isLastColumnMd = (index + 1) % colsMd === 0;
					const isLastColumnLg = (index + 1) % colsLg === 0;
					const isLastRowMd = index >= totalItems - colsMd;
					const isLastRowLg = index >= totalItems - colsLg;

					return (
						<Card
							key={`${testimonial.author}-${testimonial.title}`}
							className={cn(
								"justify-between gap-6 rounded-none border-0",
								!isLastColumnMd && "md:border-r",
								!isLastColumnLg && "lg:border-r",
								isLastColumnLg && "lg:border-r-0",
								!isLastRowMd && "md:border-b",
								!isLastRowLg && "lg:border-b",
								isLastRowLg && "lg:border-b-0",
								index < totalItems - colsLg && "border-b",
							)}
						>
							<CardContent className="space-y-4">
								<Image src={commasIcon} alt="Commas" className="w-8" />
								<p className="text-foreground text-paragraph">
									{testimonial.quote}
								</p>
							</CardContent>
							<CardFooter>
								<div className="w-full space-y-1 border-t pt-4">
									<p className="font-semibold text-foreground">
										{testimonial.author}
									</p>
									<p className="text-muted-foreground text-sm">
										{testimonial.title.split("@").map((part, i) =>
											i === 0 ? (
												<span key={`${testimonial.author}-title-${i}`}>
													{part}
												</span>
											) : (
												<span
													key={`${testimonial.author}-title-${i}`}
													className="font-semibold"
												>
													@{part}
												</span>
											),
										)}
									</p>
								</div>
							</CardFooter>
						</Card>
					);
				})}
			</div>
		</TitleWrapper>
	);
};
