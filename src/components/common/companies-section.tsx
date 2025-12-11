"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";

import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

type Company = {
	src: string;
};

const COMPANIES: Company[] = [
	{ src: "/assets/common/zipRecruiter.svg" },
	{ src: "/assets/common/stripe.svg" },
	{ src: "/assets/common/glassDoor.svg" },
	{ src: "/assets/common/figma.svg" },
	{ src: "/assets/common/linkedin.svg" },
	{ src: "/assets/common/angleList.svg" },
	{ src: "/assets/common/shopify.png" },
	{ src: "/assets/common/stackOverflow.svg" },
	{ src: "/assets/common/github.png" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 3));
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		[arr[i], arr[j]] = [arr[j]!, arr[i]!];
	}
	return arr;
};

export const CompaniesSection = () => {
	const [mounted, setMounted] = useState(false);
	const [shuffledCompanies, setShuffledCompanies] = useState<Company[]>([]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setMounted(true);
			setShuffledCompanies(shuffleArray(COMPANIES));
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="mx-auto max-w-sub-container space-y-5 border-x-2 py-5">
			<h2 className="text-center font-bold! text-heading-h5 capitalize">
				We pull jobs from sources most job seekers never check
			</h2>

			<div>
				{!mounted || shuffledCompanies.length === 0 ? (
					<div className="mt-6 flex justify-center gap-4 overflow-hidden">
						{Array.from({ length: 8 }, (_, index) => `skeleton-${index}`).map(
							(key) => (
								<Skeleton
									key={key}
									className="h-14 w-32 rounded-lg bg-muted-foreground/10"
								/>
							),
						)}
					</div>
				) : (
					<Marquee
						className="space-x-5 overflow-hidden"
						direction="left"
						speed={50}
					>
						{shuffledCompanies.map((company) =>
							company ? (
								<>
									<div key={company.src} className="mx-2 p-3">
										<Image
											width={120}
											height={40}
											src={company.src}
											className="h-8 w-auto opacity-80 brightness-50 grayscale"
											alt="Company Logo"
										/>
									</div>
								</>
							) : null,
						)}
					</Marquee>
				)}
			</div>
		</div>
	);
};
