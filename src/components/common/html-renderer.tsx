"use client";

import { cleanAndDecodeHtml } from "@/lib/utils";
import { TitleCard } from "./cards/title-card";

import parse from "html-react-parser";

export const HtmlRenderer = ({ html }: { html: string | null }) => {
	return (
		<TitleCard title="About the Role" classNames="border-2">
			{html ? (
				<div className="prose prose-sm sm:prose base lg:prose-lg prose-neutral max-w-none prose-code:rounded prose-img:rounded-xl prose-img:border prose-blockquote:border-muted-foreground/40 prose-img:border-border prose-blockquote:border-l-4 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-blockquote:pl-4 prose-headings:font-semibold prose-a:text-primary prose-headings:text-foreground prose-strong:text-foreground prose-blockquote:italic prose-a:no-underline hover:prose-a:underline">
					{parse(cleanAndDecodeHtml(html))}
				</div>
			) : (
				<p className="text-muted-foreground">
					No description available for this position.
				</p>
			)}
		</TitleCard>
	);
};
