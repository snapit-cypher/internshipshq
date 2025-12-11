import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { TitleWrapper } from "@/wrappers";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const InternshipGuideSection = ({
	steps,
}: {
	steps: {
		number: number;
		title: string;
		description: string;
		strategyLinks: { label: string; url: string }[];
	}[];
}) => {
	return (
		<TitleWrapper
			title="Secure Your Dream Internship"
			para="Level up your career with this interactive step-by-step guide. Track your progress, unlock achievements, and land that offer."
			className="pb-content-lg"
		>
			<div className="space-y-6">
				<div className="flex justify-center">
					<Button size="lg" asChild>
						<Link href="/jobs">Start your mission</Link>
					</Button>
				</div>
				<div className="space-y-4 rounded-lg border border-border p-4">
					<Accordion type="single" collapsible defaultValue="step-1">
						{steps.map((step) => (
							<AccordionItem
								key={step.number}
								value={`step-${step.number}`}
								className="accordion-item relative overflow-visible rounded-lg border border-border bg-background data-[state=open]:border-foreground [&[data-state=closed]_.step-badge]:bg-muted [&[data-state=closed]_.step-badge]:text-muted-foreground [&[data-state=open]_.step-badge]:bg-foreground [&[data-state=open]_.step-badge]:text-white [&[data-state=open]_.vertical-line]:block"
							>
								<AccordionTrigger className="relative z-10 px-5 py-5 hover:no-underline [&>svg]:shrink-0">
									<div className="flex w-full items-start gap-4 pr-4">
										<div className="step-badge relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-bold text-lg transition-all duration-200">
											{step.number}
										</div>
										<div className="flex-1 text-left">
											<h3 className="font-bold text-foreground text-heading-h4">
												{step.title}
											</h3>
											<p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
												{step.description}
											</p>
										</div>
									</div>
								</AccordionTrigger>
								<AccordionContent className="relative px-5 pt-0 pb-6">
									<div className="vertical-line absolute top-0 bottom-0 left-[56px] hidden w-0.5 bg-foreground/20" />
									<div className="relative z-10 ml-14 space-y-5">
										<h4 className="font-bold text-foreground text-heading-h5">
											Strategy
										</h4>
										<ul className="space-y-4">
											{step.strategyLinks.map((link) => (
												<li key={link.url}>
													<a
														href={link.url}
														target="_blank"
														rel="noopener noreferrer"
														className="group flex items-start gap-3 text-foreground transition-colors hover:text-primary"
													>
														<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/60 bg-background" />
														<span className="flex items-center gap-2 text-sm leading-relaxed">
															{link.label}
															<ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
														</span>
													</a>
												</li>
											))}
										</ul>
									</div>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</TitleWrapper>
	);
};
