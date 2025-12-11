import { inngest } from "@/app/inngest/client";
import {
	dailyDigestEmails,
	dailySync,
	expiredSync,
	firehoseSync,
	googleIndexJobs,
	googleRemoveExpiredJobs,
	jobAlertsEmails,
	modifiedSync,
} from "@/app/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [
		firehoseSync,
		dailySync,
		modifiedSync,
		expiredSync,
		// dailyDigestEmails,
		// jobAlertsEmails,
		// googleIndexJobs,
		// googleRemoveExpiredJobs,
	],
});
