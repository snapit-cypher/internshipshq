"use client";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TitleWrapper } from "@/wrappers";
import { useState } from "react";

type ColorDefinitionT =
	| {
			name: string;
			type: "pair";
			classes: {
				background: string;
				foreground: string;
			};
			notes: string[];
	  }
	| {
			name: string;
			type: "single";
			classes: {
				background: string;
			};
			notes: string[];
	  };

const colors: ColorDefinitionT[] = [
	{
		name: "primary",
		type: "pair",
		classes: {
			background: "bg-primary",
			foreground: "text-primary-foreground",
		},
		notes: ["Completed", "This is our primary color."],
	},
	{
		name: "background",
		type: "pair",
		classes: {
			background: "bg-background",
			foreground: "text-foreground",
		},
		notes: [
			"Completed",
			"This color is used for the background & foreground of the entire page.",
		],
	},
	{
		name: "card",
		type: "pair",
		classes: {
			background: "bg-card",
			foreground: "text-card-foreground",
		},
		notes: [
			"Completed",
			"This color exactly match our background & foreground colors.",
		],
	},
	{
		name: "secondary",
		type: "pair",
		classes: {
			background: "bg-secondary",
			foreground: "text-secondary-foreground",
		},
		notes: [
			"Completed",
			"This color is used in the payment screen dialog section named as 'New User Deal'.",
		],
	},
	{
		name: "muted",
		type: "pair",
		classes: {
			background: "bg-muted",
			foreground: "text-muted-foreground",
		},
		notes: ["Completed", "This color is used in the footer of the Dialogs."],
	},
	{
		name: "accent",
		type: "pair",
		classes: {
			background: "bg-accent",
			foreground: "text-accent-foreground",
		},
		notes: [
			"Completed",
			"This color is used as the warning sections & badges in the website.",
		],
	},
	{
		name: "destructive",
		type: "pair",
		classes: {
			background: "bg-destructive",
			foreground: "text-destructive-foreground",
		},

		notes: [
			"Completed",
			"Color used for the destructive action buttons & errors messages.",
		],
	},
	{
		name: "popover",
		type: "pair",
		classes: {
			background: "bg-popover",
			foreground: "text-popover-foreground",
		},
		notes: [
			"Pending",
			"We will updated this color in the future when we have more pages.",
		],
	},
	// Singes
	{
		name: "border",
		type: "single",
		classes: {
			background: "bg-border",
		},
		notes: ["Completed", " This color will be used whenever we need a border."],
	},
	{
		name: "input",
		type: "single",
		classes: {
			background: "bg-input",
		},
		notes: [
			"Completed",
			"This color is used as a light background for the input fields.",
		],
	},
	{
		name: "ring",
		type: "pair",
		classes: {
			background: "bg-ring",
			foreground: "text-background",
		},
		notes: [
			"Completed",
			"This color will be used whenever we need to add a focus style.",
		],
	},
];

export const Colors = () => {
	const [search, setSearch] = useState("");

	const filtered = colors.filter(({ name, type, classes }) => {
		const term = search.toLowerCase();
		if (name.toLowerCase().includes(term)) return true;
		// for pairs, also match the foreground class name (minus the 'bg-' prefix)
		if (
			type === "pair" &&
			classes.foreground.replace(/^bg-/, "").toLowerCase().includes(term)
		) {
			return true;
		}
		return false;
	});

	return (
		<TitleWrapper
			title="Colors"
			className="py-content-sm"
			para="Browse background & foreground color pairs at a glance."
		>
			<Input
				type="text"
				placeholder="Search colors..."
				className="h-12 border border-border"
				value={search}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					setSearch(e.target.value)
				}
			/>
			<div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
				{filtered.map(({ name, type, classes, notes }) => {
					const bgClass = classes.background;
					const textClass = type === "pair" && classes.foreground;

					return (
						<Card key={name} className="gap-2 overflow-hidden p-0 capitalize">
							<CardHeader
								className={cn(bgClass, "relative h-32 border-border border-b")}
							>
								<h4
									className={cn(
										textClass,
										"absolute bottom-0.5 left-2.5 rounded-md font-extrabold text-lg tracking-wide",
									)}
								>
									{name}
								</h4>
							</CardHeader>
							<CardFooter className="flex-col items-start gap-2 px-2">
								<div className="flex w-full items-center justify-between text-sm">
									<span className="font-bold">Color Type</span>
									<span
										className={cn(
											"rounded-md border px-6 py-0.5 font-semibold",
											bgClass,
											textClass,
										)}
									>
										{type}
									</span>
								</div>
								<div className="my-3">
									<h4 className="mb-2 font-semibold text-muted-foreground">
										Descriptions
									</h4>
									<ul className="list-disc space-y-1 pr-2 pl-5 text-muted-foreground text-sm">
										{notes.map((note, idx) => (
											<li
												key={note}
												className={cn(
													"pl-1",
													idx === 0 ? "font-semibold" : "font-normal",
												)}
											>
												{note}
											</li>
										))}
									</ul>
								</div>
							</CardFooter>
						</Card>
					);
				})}
			</div>
		</TitleWrapper>
	);
};
