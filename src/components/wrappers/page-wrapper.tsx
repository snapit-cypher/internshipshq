import { BottomCta } from "@/common/bottom-cta";
import { Footer } from "@/common/footer";
import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

export const PageWrapper = ({
	children,
	showCta = false,
	showFooter = true,
	className,
}: {
	children: ReactNode;
	showCta?: boolean;
	showFooter?: boolean;
	className?: string;
}) => {
	return (
		<main className={cn("relative", className)}>
			{children}
			{showCta && <BottomCta />}
			{showFooter && <Footer />}
		</main>
	);
};
