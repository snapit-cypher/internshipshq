import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const Wrapper = ({
	children,
	id,
	className,
}: Readonly<{
	children?: ReactNode | ReactNode[];
	id?: string;
	className?: string;
}>) => {
	return (
		<div
			className={cn("mx-auto max-w-container px-0 lg:px-content", className)}
			id={id}
		>
			{children}
		</div>
	);
};
