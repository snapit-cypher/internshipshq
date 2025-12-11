"use client";

import { Logo } from "@/components/common/header/logo";
import { cn, getDailyCounts } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const AuthContainer = ({
	children,
	variant = "page",
}: {
	children: React.ReactNode;
	variant?: "page" | "modal";
}) => {
	if (variant === "modal") {
		return <div className="w-full">{children}</div>;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted p-8">
			<div
				className={cn(
					"w-full max-w-lg rounded-lg bg-background p-8 drop-shadow-md",
				)}
			>
				{children}
			</div>
		</div>
	);
};

export const AuthDivider = () => {
	return (
		<div className="relative my-6">
			<div className="absolute inset-0 flex items-center">
				<span className="w-full border-2 border-t" />
			</div>
			<div className="relative flex justify-center text-xs uppercase">
				<span className="bg-background px-2 text-muted-foreground">
					Or continue with
				</span>
			</div>
		</div>
	);
};

export const AuthStats = ({
	className = "",
	stats,
	withGradient = false,
	gradientClassName = "bg-gradient-to-r from-tranparent to-green-200",
}: {
	className?: string;
	stats?: {
		icon: LucideIcon;
		title: string;
		description: string;
		className?: string;
	}[];
	withGradient?: boolean;
	gradientClassName?: string;
}) => {
	const statsArray = stats;
	return (
		<div
			className={cn(
				"mt-8",
				withGradient && cn("rounded p-[1.5px]", gradientClassName),
				className,
			)}
		>
			<div
				className={cn(
					"grid grid-cols-2 overflow-hidden rounded border-2 md:grid-cols-3",
					withGradient && "last:border-0",
				)}
			>
				{statsArray?.map((stat) => {
					return (
						<div
							key={stat.title}
							className={cn(
								"flex flex-col gap-2 border-r bg-background p-3.5",
								stat.className,
								withGradient && "last:border-r-0!",
							)}
						>
							<stat.icon className="size-5 text-muted-foreground" />
							<div className="mt-1 space-y-1">
								<p className="font-semibold text-xs">{stat.title}</p>
								<p className="text-muted-foreground text-xs">
									{stat.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export const AuthHeader = ({
	title,
	subtitle,
}: {
	title: string;
	subtitle: string;
}) => {
	return (
		<div className="mb-8 flex flex-col space-y-10">
			<Logo />
			<div className="space-y-1">
				<h1 className="font-bold text-2xl tracking-tight">{title}</h1>
				<p className="text-muted-foreground text-sm">{subtitle}</p>
			</div>
		</div>
	);
};

export const AuthFooter = ({
	variant = "daily",
}: { variant?: "hourly" | "daily" }) => {
	const [count, setCount] = useState<number>(30);

	useEffect(() => {
		const counts = getDailyCounts();
		setCount(variant === "hourly" ? counts.hourly : counts.daily);
	}, [variant]);

	const message =
		variant === "hourly"
			? `${count} people unlocked full access in the last 24 hours.`
			: `${count} people landed interviews using InternshipsHQ yesterday.`;

	return (
		<p className="mt-5 text-center font-semibold text-primary text-sm">
			{message}
		</p>
	);
};
