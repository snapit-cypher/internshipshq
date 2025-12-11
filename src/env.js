import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.string().optional(),
		DATABASE_URL: z.string().url(),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		GHOST_URL: z.string().url(),
		GHOST_CONTENT_API_KEY: z.string(),
		GHOST_ADMIN_API_KEY: z.string(),
		RAPID_API_HOST: z.string(),
		RAPID_API_KEY: z.string(),
		RESEND_API_KEY: z.string(),
		RESEND_DOMAIN: z.string(),
		AUTH_GOOGLE_ID: z.string(),
		AUTH_GOOGLE_SECRET: z.string(),
		LOGSNAG_API_TOKEN: z.string(),
		LOGSNAG_PROJECT: z.string(),
		CRON_SECRET: z.string(),
		INNGEST_SIGNING_KEY: z.string(),
		INNGEST_EVENT_KEY: z.string(),
		LOOPS_API_KEY: z.string(),
		GOOGLE_SERVICE_ACCOUNT_KEY: z.string(),
	},
	client: {
		NEXT_PUBLIC_POSTHOG_KEY: z.string(),
		NEXT_PUBLIC_POSTHOG_HOST: z.string(),
		NEXT_PUBLIC_HOST_URL: z.string(),
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		AUTH_SECRET: process.env.AUTH_SECRET,
		AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
		AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,
		NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		NEXT_PUBLIC_HOST_URL: process.env.NEXT_PUBLIC_HOST_URL,
		GHOST_URL: process.env.GHOST_URL,
		GHOST_CONTENT_API_KEY: process.env.GHOST_CONTENT_API_KEY,
		GHOST_ADMIN_API_KEY: process.env.GHOST_ADMIN_API_KEY,
		RAPID_API_HOST: process.env.RAPID_API_HOST,
		RAPID_API_KEY: process.env.RAPID_API_KEY,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		RESEND_DOMAIN: process.env.RESEND_DOMAIN,
		LOGSNAG_API_TOKEN: process.env.LOGSNAG_API_TOKEN,
		LOGSNAG_PROJECT: process.env.LOGSNAG_PROJECT,
		CRON_SECRET: process.env.CRON_SECRET,
		INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
		INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
		LOOPS_API_KEY: process.env.LOOPS_API_KEY,
		GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
