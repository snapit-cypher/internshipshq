import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { TitleWrapper } from "@/wrappers";

export const FrequentlyAskedQuestions = () => {
	return (
		<TitleWrapper title="Frequently Asked Questions" className="pb-content-lg">
			<Accordion type="single" collapsible className="w-full">
				{siteConfig.siteContent.faqs.map((faq) => (
					<Card
						className="rounded-none border border-border border-t-0 bg-background py-2 shadow-none first:rounded-t-md first:border-t last:rounded-b-md"
						key={faq.question}
					>
						<AccordionItem className="border-none px-4" value={faq.question}>
							<AccordionTrigger className="gap-6 text-left font-semibold text-sm md:font-bold md:text-base">
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className="space-y-4 text-left text-[15px] leading-6">
								{faq.content.map((block, index) => {
									if (block.type === "paragraph") {
										return (
											<p
												key={cn(faq.question, "-p-", index)}
												className="text-muted-foreground"
											>
												{block.text}
											</p>
										);
									}
									return (
										<ul
											key={cn(faq.question, "-list-", index)}
											className="list-inside list-disc space-y-1 text-muted-foreground"
										>
											{block.items.map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>
									);
								})}
							</AccordionContent>
						</AccordionItem>
					</Card>
				))}
			</Accordion>
		</TitleWrapper>
	);
};
