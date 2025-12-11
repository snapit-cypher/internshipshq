import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { alertPreferences } from "@/server/db/schema";

export const alertsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "Alert name is required"),
				locations: z.array(z.string()).optional(),
				categories: z.array(z.string()).optional(),
				remoteOnly: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			console.log(userId);
			const newAlert = await db
				.insert(alertPreferences)
				.values({
					userId,
					name: input.name,
					locations: input.locations ?? [],
					keywords: input.categories ?? [],
					remoteOnly: input.remoteOnly ?? false,
				})
				.returning();

			return {
				success: true,
				alert: newAlert[0],
			};
		}),
});
