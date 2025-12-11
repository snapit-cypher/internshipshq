import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type React from "react";

export function JobInformation({
	items,
	classNames,
}: {
	items: { icon: LucideIcon; label: string; value: string; url?: string }[];
	classNames?: string;
}) {
	return (
		<div
			className={cn(
				"relative z-20 grid rounded-md border-2 border-border bg-background md:grid-cols-2 lg:grid-cols-4",
				classNames,
			)}
		>
			{items.map((item) => {
				const Icon = item.icon;
				return (
					<div
						key={item.label}
						className="flex items-center gap-3 p-4 last:border-r-0 max-sm:border-b-2 last:max-sm:border-b-0 md:border-r-2"
					>
						<div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border">
							<Icon className="size-5 text-muted-foreground" />
						</div>
						<div className="flex flex-col">
							<span className="font-jet-brains-mono text-muted-foreground text-sm">
								{item.label}
							</span>
							<span className="font-bold text-foreground text-sm">
								{item.value}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
