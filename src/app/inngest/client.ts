import { env } from "@/env";
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
	id: "internships_hq",
	signingKey: env.INNGEST_SIGNING_KEY,
	eventKey: env.INNGEST_EVENT_KEY,
});
