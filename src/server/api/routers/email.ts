import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { emailSubscribers } from "@/server/db/schema";

export const emailRouter = createTRPCRouter({
	subscribe: publicProcedure
		.input(
			z.object({
				email: z.string().email("Invalid email address"),
				categories: z.array(z.string()).max(2).min(1).optional(),
			}),
		)
		.mutation(async ({ input: { email, categories } }) => {
			const unsubscribeToken = crypto.randomUUID();
			await db
				.insert(emailSubscribers)
				.values({
					email,
					categories: categories || null,
					isSubscribed: true,
					unsubscribeToken,
				})
				.onConflictDoUpdate({
					target: [emailSubscribers.email],
					set: {
						categories: categories || null,
					},
				});
			return {
				success: true,
				message:
					"Successfully subscribed! You'll receive our daily digest with top jobs.",
				newSubscriber: true,
			};
		}),
});
