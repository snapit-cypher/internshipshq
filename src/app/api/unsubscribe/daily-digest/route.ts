import { createRedirectUrl } from "@/lib/serverUtils";
import { db } from "@/server/db";
import { emailSubscribers } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get("token");

		const subscriber = await db
			.update(emailSubscribers)
			.set({
				isSubscribed: false,
				unsubscribedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(emailSubscribers.unsubscribeToken, token ?? ""))
			.returning({ email: emailSubscribers.email });

		if (subscriber.length === 0) {
			return NextResponse.json(
				{ error: "Failed to unsubscribe" },
				{ status: 500 },
			);
		}

		return NextResponse.redirect(
			createRedirectUrl({
				success: true,
				message:
					"Successfully unsubscribed. You will no longer receive our daily digest.",
			}),
		);
	} catch (error) {
		console.error("Daily digest test error:", error);
		return NextResponse.redirect(
			createRedirectUrl({
				error: true,
				message: "Oops! Something went wrong. Please contact support.",
			}),
		);
	}
}
