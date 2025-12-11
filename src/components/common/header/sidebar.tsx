"use client";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { siteConfig } from "@/config/site";
import { useSystem } from "@/hooks/use-system";
import { reorderCategoriesByCount } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export const Sidebar = () => {
	const { status, jobCategories } = useSystem();
	const [open, setOpen] = useState(false);

	const headerNavItems = useMemo(() => {
		return siteConfig.mainNav.map((item) => {
			if (item.id === 2 && item.type === "dropdown" && item.pages) {
				const reorderedPages = reorderCategoriesByCount(
					item.pages as Array<{
						label: string;
						link: string;
						type: string;
						badge: string | null;
						disabled: boolean;
					}>,
					jobCategories,
				);
				return { ...item, pages: reorderedPages };
			}
			return item;
		});
	}, [jobCategories]);

	return (
		<div className="lg:hidden">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Menu className="size-6 cursor-pointer lg:hidden" />
				</PopoverTrigger>
				<PopoverContent align="end" className="w-60 space-y-2 p-4">
					<div className="space-y-2 pb-2">
						{status === "unauthenticated" && (
							<div className="flex flex-col space-y-2">
								<Button className="px-3" asChild variant="outline">
									<Link href="/auth/signin">Sign in</Link>
								</Button>
								<Button className="px-3" asChild>
									<Link href="/auth/signup">Find your job</Link>
								</Button>
							</div>
						)}
					</div>
					<div className="flex flex-col space-y-3">
						{headerNavItems
							.filter((item) => item.forHeader)
							.map((item) => {
								if (item.type === "dropdown" && item.pages) {
									return (
										<div
											key={item.title}
											className="border-b pb-2 last:border-b-0"
										>
											<div className="pb-2 font-medium text-xs">
												{item.title}
											</div>
											<div className="flex max-h-36 flex-col space-y-1 overflow-y-auto pl-4">
												{item.pages.map((page) => (
													<Link
														key={page.label}
														href={page.disabled ? "#" : page.link}
														className="text-muted-foreground text-xs hover:text-primary"
														onClick={() => setOpen(false)}
														aria-disabled={page.disabled}
														tabIndex={page.disabled ? -1 : 0}
													>
														{page.label}
													</Link>
												))}
											</div>
										</div>
									);
								}
								return (
									<Link
										key={item.title}
										href={item.href}
										className="border-b pb-2 font-medium text-xs last:border-b-0 hover:text-primary"
										onClick={() => setOpen(false)}
									>
										{item.title}
									</Link>
								);
							})}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};
