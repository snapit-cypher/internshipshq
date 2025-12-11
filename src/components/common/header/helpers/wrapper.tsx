"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystem } from "@/hooks/use-system";
import dynamic from "next/dynamic";
import Link from "next/link";

const UserMenu = dynamic(
	() => import("../user-menu").then((mod) => mod.UserMenu),
	{ ssr: false },
);

export const LargeScreenMenuWrapper = () => {
	const { user, status } = useSystem();

	return (
		<div className="hidden xl:block">
			<div className="mt-1 mr-2 flex items-center justify-end gap-1">
				{status === "loading" && <Skeleton className="size-8 rounded-full" />}
				{status === "authenticated" && user && <UserMenu user={user} />}
				{status === "unauthenticated" && (
					<div className="flex items-center gap-1">
						<Button
							className="px-3 hover:bg-transparent!"
							asChild
							variant="ghost"
						>
							<Link href="/auth/signin">Sign In</Link>
						</Button>
						<Button className="px-3" asChild>
							<Link href="/auth/signup">Find Jobs</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};
