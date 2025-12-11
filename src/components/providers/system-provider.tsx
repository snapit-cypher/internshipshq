"use client";

import type { JobCategoryT } from "@/lib/types";
import { api } from "@/trpc/react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { createContext, useMemo } from "react";

export const SystemContext = createContext<{
	user: Session["user"] | null | undefined;
	status: "loading" | "authenticated" | "unauthenticated";
	update: () => Promise<Session | null>;
	jobCategories: JobCategoryT[];
}>({
	user: null,
	status: "loading",
	update: () => Promise.resolve(null),
	jobCategories: [],
});

export const SystemProvider = ({ children }: { children: React.ReactNode }) => {
	const { data: session, status, update } = useSession();
	const { data: jobCategories = [] } = api.jobs.getJobCategories.useQuery(
		undefined,
		{
			staleTime: 6 * 60 * 60 * 1000,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		},
	);

	const contextValue = useMemo(
		() => ({
			user: session?.user as Session["user"] | null | undefined,
			status: status as "loading" | "authenticated" | "unauthenticated",
			update: update,
			jobCategories: jobCategories,
		}),
		[session?.user, status, update, jobCategories],
	);

	return (
		<SystemContext.Provider value={contextValue}>
			{children}
		</SystemContext.Provider>
	);
};
