"use client";

import Link from "next/link";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { siteConfig } from "@/config/site";
import { useSystem } from "@/hooks/use-system";
import { cn, reorderCategoriesByCount } from "@/lib/utils";
import { useMemo } from "react";

export const Menu = () => {
	const { jobCategories } = useSystem();
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
		<NavigationMenu className="hidden max-w-none md:flex" viewport={false}>
			<NavigationMenuList className="gap-9">
				{headerNavItems
					.filter((item) => item.forHeader)
					.map((item) => {
						const itemBadge =
							"badge" in item && typeof item.badge === "string"
								? item.badge
								: null;

						return (
							<NavigationMenuItem key={item.title}>
								{item.type === "dropdown" ? (
									<>
										<NavigationMenuTrigger className="border-0 px-0 py-0 font-semibold text-muted-foreground text-sm">
											{item.title}
										</NavigationMenuTrigger>
										<NavigationMenuContent className="w-auto">
											<div className="flex max-h-72 min-w-max flex-col gap-1 overflow-y-auto rounded-lg">
												{item.pages?.map((page) => {
													const isDisabled = page.disabled;
													return (
														<Link
															key={page.label}
															href={isDisabled ? "#" : page.link}
															aria-disabled={isDisabled}
															tabIndex={isDisabled ? -1 : 0}
															className={cn(
																"flex items-center justify-between rounded-md px-3 py-2 font-medium text-foreground text-sm transition-colors",
																isDisabled
																	? "pointer-events-none opacity-50"
																	: "hover:bg-muted",
															)}
														>
															<span>{page.label}</span>
															{page.badge ? (
																<span className="ml-4 rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground text-xs">
																	{page.badge}
																</span>
															) : null}
														</Link>
													);
												})}
											</div>
										</NavigationMenuContent>
									</>
								) : (
									<Link
										className="font-semibold text-muted-foreground text-sm transition-colors hover:text-foreground"
										href={item.href}
									>
										{item.title}
									</Link>
								)}
							</NavigationMenuItem>
						);
					})}
			</NavigationMenuList>
		</NavigationMenu>
	);
};
