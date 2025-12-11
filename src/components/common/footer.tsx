"use client";

import { Wrapper } from "@/components/wrappers";
import { siteConfig } from "@/config/site";
import { useSystem } from "@/hooks/use-system";
import Link from "next/link";
import { Button } from "../ui/button";
import { Logo } from "./header/logo";

export const Footer = () => {
	const { status } = useSystem();
	return (
		<footer className="border-t-2 px-content-sm py-10">
			<Wrapper className="max-w-sub-container! items-center gap-6">
				<div className="space-y-8">
					{/* First row: Logo/Button and Company/Legal */}
					<div className="grid gap-6 md:grid-cols-[2fr_1fr]">
						<div className="space-y-4">
							<Logo showDescription={true} />
							<Button asChild className="hidden w-1/2 lg:block lg:w-fit">
								<Link
									href={status === "unauthenticated" ? "/auth/signup" : "/jobs"}
								>
									Find your next job
								</Link>
							</Button>
						</div>
						<div className="flex flex-col justify-between gap-y-4 sm:flex-row sm:gap-x-8">
							<div className="space-y-2 md:space-y-3">
								<h3 className="font-semibold text-sm">Company</h3>
								<ul className="space-y-2">
									{siteConfig.mainNav
										.filter(
											(item) =>
												item.group === "Company" &&
												item.forFooter &&
												item.type !== "dropdown",
										)
										.map((page) => (
											<li key={page.href}>
												<Link
													href={page.href}
													className="text-accent-foreground text-sm hover:text-primary"
												>
													{page.title}
												</Link>
											</li>
										))}
								</ul>
							</div>
							<div className="space-y-2 md:space-y-3">
								<h3 className="font-semibold text-sm">Legal</h3>
								<ul className="space-y-2">
									{siteConfig.mainNav
										.filter((item) => item.group === "Legal" && item.forFooter)
										.map((page) => (
											<li key={page.href}>
												<Link
													href={page.href}
													className="text-accent-foreground text-sm hover:text-primary"
												>
													{page.title}
												</Link>
											</li>
										))}
								</ul>
							</div>
						</div>
					</div>
					{/* Second row: Job Categories split into three columns */}
					<div className="space-y-2 md:space-y-3">
						<h3 className="font-semibold text-sm">Job Categories</h3>
						<div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
							{(() => {
								const jobCategories =
									siteConfig.mainNav.find(
										(item) => item.id === 2 && item.type === "dropdown",
									)?.pages || [];
								const itemsPerColumn = Math.ceil(jobCategories.length / 3);
								const firstColumn = jobCategories.slice(0, itemsPerColumn);
								const secondColumn = jobCategories.slice(
									itemsPerColumn,
									itemsPerColumn * 2,
								);
								const thirdColumn = jobCategories.slice(itemsPerColumn * 2);

								return (
									<>
										<ul className="space-y-2">
											{firstColumn.map((page) => (
												<li key={page.label}>
													<Link
														href={page.link}
														className="text-accent-foreground text-sm hover:text-primary"
													>
														{page.label}
													</Link>
												</li>
											))}
										</ul>
										<ul className="space-y-2">
											{secondColumn.map((page) => (
												<li key={page.label}>
													<Link
														href={page.link}
														className="text-accent-foreground text-sm hover:text-primary"
													>
														{page.label}
													</Link>
												</li>
											))}
										</ul>
										<ul className="space-y-2">
											{thirdColumn.map((page) => (
												<li key={page.label}>
													<Link
														href={page.link}
														className="text-accent-foreground text-sm hover:text-primary"
													>
														{page.label}
													</Link>
												</li>
											))}
										</ul>
									</>
								);
							})()}
						</div>
					</div>
				</div>
				<div className="mt-8 flex w-full flex-col items-center justify-between gap-4 border-accent-foreground border-t pt-2 text-center text-sm md:flex-row">
					<p className="text-accent-foreground">
						© 2025 InternshipsHQ. All rights reserved.
					</p>
					<div className="flex items-center gap-2 text-accent-foreground">
						Made with{" "}
						<div className="h-4 w-4">
							<iframe
								title="hearIcon"
								src="https://lottie.host/embed/101a3cda-23bf-406e-91ac-d02871bbf055/2lv5OSDZpT.lottie"
								width="100%"
								height="100%"
							/>
						</div>
						in San Francisco
					</div>
				</div>
			</Wrapper>
		</footer>
	);
};
