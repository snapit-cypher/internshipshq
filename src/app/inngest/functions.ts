import { jobSyncService } from "@/server/services/job-sync";

import {
	googleIndexingService,
	sendDailyDigest,
	sendJobAlerts,
} from "@/server/services";

import { inngest } from "./client";

export const firehoseSync = inngest.createFunction(
	{ id: "firehose-sync", name: "Firehose Sync" },
	{ cron: "45 */6 * * *" },
	async () => {
		const result = await jobSyncService.syncHourlyJobs();
		return {
			...result,
			timestamp: new Date().toISOString(),
			endpoint: "/active-ats-1h",
		};
	},
);

export const dailySync = inngest.createFunction(
	{ id: "daily-sync", name: "Daily Sync" },
	{ cron: "0 6 * * *" },
	async () => {
		const result = await jobSyncService.syncDailyJobs({
			targetJobs: 200,
		});
		return {
			...result,
			timestamp: new Date().toISOString(),
			endpoint: "/active-ats-24h",
		};
	},
);

export const modifiedSync = inngest.createFunction(
	{ id: "modified-sync", name: "Modified Sync" },
	{ cron: "0 2 * * 1,4,6" },
	async () => {
		const result = await jobSyncService.syncModifiedJobs();
		return {
			...result,
			timestamp: new Date().toISOString(),
			endpoint: "/active-ats-modified",
		};
	},
);

export const expiredSync = inngest.createFunction(
	{ id: "expired-sync", name: "Expired Sync" },
	{ cron: "0 3 * * 2,5" },
	async () => {
		const result = await jobSyncService.syncExpiredJobs();
		return {
			...result,
			timestamp: new Date().toISOString(),
			endpoint: "/active-ats-expired",
		};
	},
);

export const dailyDigestEmails = inngest.createFunction(
	{ id: "daily-digest-email", name: "Daily Digest Email" },
	{ cron: "TZ=America/New_York 0 10 * * *" },
	async () => {
		const result = await sendDailyDigest();
		return {
			...result,
			timestamp: new Date().toISOString(),
			endpoint: "/daily-digest-email",
		};
	},
);

export const jobAlertsEmails = inngest.createFunction(
	{ id: "job-alerts-email", name: "Job Alerts Email" },
	{ cron: "0 */8 * * *" },
	async () => {
		const result = await sendJobAlerts();
		return {
			...result,
			timestamp: new Date().toISOString(),
			endpoint: "/job-alerts-email",
		};
	},
);

export const googleIndexJobs = inngest.createFunction(
	{ id: "google-index-jobs", name: "Google Index Jobs" },
	{ cron: "0 8,16 * * *" }, // 8am and 4pm - 2x per day = 200 jobs/day (100 per run)
	async () => {
		const result = await googleIndexingService.batchIndexPendingJobs(75);
		return {
			...result,
			timestamp: new Date().toISOString(),
			endpoint: "/google-index-jobs",
		};
	},
);

export const googleRemoveExpiredJobs = inngest.createFunction(
	{ id: "google-remove-expired-jobs", name: "Google Remove Expired Jobs" },
	{ cron: "0 10 * * *" }, // 10am daily
	async () => {
		const result = await googleIndexingService.batchRemoveExpiredJobs(50);
		return {
			...result,
			timestamp: new Date().toISOString(),
			endpoint: "/google-remove-expired-jobs",
		};
	},
);
