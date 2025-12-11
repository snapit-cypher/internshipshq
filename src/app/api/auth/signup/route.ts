import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/password";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

const signupSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	name: z.string().optional(),
});

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const validatedData = signupSchema.safeParse(body);

		if (!validatedData.success) {
			return NextResponse.json(
				{ error: validatedData.error.errors[0]?.message ?? "Invalid input" },
				{ status: 400 },
			);
		}

		const { email, password, name } = validatedData.data;
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser.length > 0) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 409 },
			);
		}

		const hashedPassword = await hashPassword(password);
		const newUser = await db
			.insert(users)
			.values({
				email,
				password: hashedPassword,
				name: name ?? null,
				emailVerified: new Date(),
			})
			.returning();

		if (!newUser[0]) {
			return NextResponse.json(
				{ error: "Failed to create user" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Account created successfully. Please sign in.",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ error: "An error occurred during signup" },
			{ status: 500 },
		);
	}
}
