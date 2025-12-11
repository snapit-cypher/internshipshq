"use client";

import { env } from "@/env";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

const PostHogPageView = dynamic(() => import("./posthog-page-view"), {
	ssr: false,
});

export const PosthogProviderHandler = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	if (process.env.NODE_ENV === "development") {
		return children;
	}

	return <PostHogProvider>{children}</PostHogProvider>;
};

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
			api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
			capture_pageview: false, // Disable automatic pageview capture, as we capture manually
			defaults: "2025-05-24",
		});
	}, []);

	return (
		<PHProvider client={posthog}>
			<PostHogPageView />
			<PostHogAuthProvider>{children}</PostHogAuthProvider>
		</PHProvider>
	);
}

function PostHogAuthProvider({ children }: { children: React.ReactNode }) {
	const session = useSession();

	useEffect(() => {
		if (session.data?.user) {
			posthog.identify(session.data.user.id, {
				email: session.data.user.email,
				name: session.data.user.name,
			});
		} else if (!session.data?.user) {
			posthog.reset();
		}
	}, [session]);

	return children;
}
