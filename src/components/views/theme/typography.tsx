"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TitleWrapper } from "@/wrappers";

export const Typography = () => {
	const [sample, setSample] = useState(
		"The quick brown fox jumps over the lazy dog",
	);

	return (
		<TitleWrapper
			title="Typography"
			className="py-content-sm"
			para="Explore various font sizes to enhance your design. Use the input field to search for specific sizes."
		>
			<Input
				type="text"
				placeholder="Try font sizes..."
				className="h-12"
				value={sample}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					setSample(e.target.value)
				}
			/>
			<div className="space-y-4">
				{[
					{
						key: "heading-h1",
						label: "Heading H1",
						classes: "text-heading-h1",
					},
					{
						key: "heading-h2",
						label: "Heading H2",
						classes: "text-heading-h2",
					},
					{
						key: "heading-h3",
						label: "Heading H3",
						classes: "text-heading-h3",
					},
					{
						key: "heading-h4",
						label: "Heading H4",
						classes: "text-heading-h4",
					},
					{
						key: "heading-h5",
						label: "Heading H5",
						classes: "text-heading-h5",
					},
					{
						key: "paragraph-section",
						label: "Paragraph Section",
						classes: "text-paragraph-section",
					},
					{ key: "paragraph", label: "Paragraph", classes: "text-paragraph" },
				].map(({ key, label, classes }) => (
					<FontPreviewItem
						key={key}
						label={label}
						classes={classes}
						sample={sample}
					/>
				))}
			</div>
		</TitleWrapper>
	);
};

function FontPreviewItem({
	label,
	classes,
	sample,
}: {
	label: string;
	classes: string;
	sample: string;
}) {
	return (
		<div className="flex items-center gap-6 rounded-lg p-4 shadow-sm">
			<div className="w-1/4 font-mono text-muted-foreground text-sm">
				{label}
			</div>
			<div className={cn("w-3/4", classes)}>{sample}</div>
		</div>
	);
}
