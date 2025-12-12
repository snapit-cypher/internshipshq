import "@/styles/globals.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import { MessageHandler } from "@/components/common/message-handler";
import { SystemProvider } from "@/components/providers/system-provider";
import { Toaster } from "@/components/ui/sonner";
import { TailwindIndicator } from "@/components/ui/tailwind-indicator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { fontCalSans, fontInter, fontJetBrainsMono } from "@/lib/fonts";
import type { FaqItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";
// import Script from "next/script";
import { Suspense } from "react";
import type { FAQPage, WithContext } from "schema-dts";

const formatFaqAnswer = (faq: FaqItem) => {
	const segments: string[] = [];
	for (const block of faq.content) {
		if (block.type === "paragraph") {
			segments.push(block.text.trim());
			continue;
		}
		for (const item of block.items) {
			segments.push(`- ${item.trim()}`);
		}
	}
	return segments.join("\n");
};

const faqStructuredData: WithContext<FAQPage> = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: siteConfig.siteContent.faqs.map((faq) => ({
		"@type": "Question",
		name: faq.question,
		acceptedAnswer: {
			"@type": "Answer",
			text: formatFaqAnswer(faq),
		},
	})),
};

const faqStructuredDataJson = JSON.stringify(faqStructuredData);

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: "%s",
	},
	description: siteConfig.description,
	metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL ?? ""),
	icons: {
		icon: [
			{ url: "/favicons/favicon.ico", sizes: "any" },
			{ url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{
				url: "/favicons/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				url: "/favicons/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
		apple: "/favicons/apple-touch-icon.png",
		shortcut: "/favicons/favicon.ico",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		images: [{ url: `${process.env.NEXT_PUBLIC_HOST_URL}/OG.png` }],
	},
	alternates: {
		canonical: process.env.NEXT_PUBLIC_HOST_URL,
	},
};

export default async function RootLayout({
	children,
	modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
	const session = await auth();
	return (
		<SessionProvider session={session}>
			<html
				lang="en"
				suppressHydrationWarning
				className={cn(
					fontInter.variable,
					fontCalSans.variable,
					fontJetBrainsMono.variable,
				)}
			>
				<head>
					<script
						type="application/ld+json"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
						dangerouslySetInnerHTML={{ __html: faqStructuredDataJson }}
					/>
				</head>
				<body className="relative">
					<NextTopLoader
						showSpinner={false}
						height={3}
						initialPosition={0.08}
						color="#954AFC"
						crawl
						crawlSpeed={200}
						easing="ease"
						speed={200}
						zIndex={999999}
					/>
					<TRPCReactProvider>
						<SystemProvider>
							<TooltipProvider>
								{children}
								{modal}
							</TooltipProvider>
						</SystemProvider>
					</TRPCReactProvider>
					<Suspense fallback={null}>
						<MessageHandler />
					</Suspense>
					<Toaster position="bottom-right" richColors expand />
					<TailwindIndicator />
					{/* <Script
							defer
							strategy="afterInteractive"
							type="text/javascript"
							src="https://api.pirsch.io/pa.js"
							id="pianjs"
							data-code="H85LgXeGS9p0RyCtqtQvWk1nPUAtuHbO"
						/> */}
				</body>
			</html>
		</SessionProvider>
	);
}
