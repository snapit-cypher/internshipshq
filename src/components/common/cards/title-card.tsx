import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type React from "react";

export const TitleCard = ({
	children,
	title,
	classNames,
	withBackgroundImage = false,
}: {
	children: React.ReactNode;
	title?: string;
	classNames?: string;
	withBackgroundImage?: boolean;
}) => {
	return (
		<Card
			className={cn(
				"overflow-hidden rounded-md border-0 border-b-2",
				classNames,
			)}
		>
			<CardContent className="relative">
				{title && (
					<CardTitle className="mb-4 font-jet-brains-mono text-foreground/60 tracking-tight">
						{title}
					</CardTitle>
				)}
				{children}
				{withBackgroundImage && (
					<div className="-translate-y-[40%] -right-5 pointer-events-none absolute top-[60%]">
						<Image
							src="/small-suitecase.png"
							alt=""
							width={400}
							height={400}
							className="object-contain"
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
