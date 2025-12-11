import Image from "next/image";
import Link from "next/link";
import logoImage from "public/logo.png";

import { cn } from "@/lib/utils";

export const Logo = ({
	className,
	showDescription,
}: {
	className?: string;
	showDescription?: boolean;
}) => {
	return (
		<div className="space-y-4">
			<Link
				href="/"
				className={cn(
					"flex items-center gap-2 font-extrabold lg:text-lg",
					className,
				)}
			>
				<Image
					src={logoImage}
					alt="InternshipsHQ's Logo"
					className="size-8 rounded"
				/>
				InternshipsHQ
			</Link>
			{showDescription && (
				<p className="max-w-para text-sm">
					The fastest way to find real, fresh jobs. We scan thousands of company
					sites, startup platforms, and hidden hiring sources every minute, so
					you see openings earlier and waste zero time on stale or spam posts.
				</p>
			)}
		</div>
	);
};
