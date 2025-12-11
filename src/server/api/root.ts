import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { alertsRouter } from "./routers/alerts";
import { blogRouter } from "./routers/blog";
import { emailRouter } from "./routers/email";
import { jobsRouter } from "./routers/jobs";

export const appRouter = createTRPCRouter({
	blog: blogRouter,
	jobs: jobsRouter,
	email: emailRouter,
	alerts: alertsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
