import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { env } from "@/env";
import { verifyPassword } from "@/lib/password";
import { ensureLoopsContact } from "@/lib/serverUtils";
import { db } from "@/server/db";
import {
	accounts,
	sessions,
	users,
	verificationTokens,
} from "@/server/db/schema";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			hasPro: boolean;
			proPurchasedAt: string;
			stripeCustomerId: string;
			stripeSubscriptionId: string;
			subscriptionStatus: string;
			subscriptionPeriodEnd: string;
			name: string;
			email: string;
			image: string;
		} & DefaultSession["user"];
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	providers: [
		GoogleProvider({
			clientId: env.AUTH_GOOGLE_ID,
			clientSecret: env.AUTH_GOOGLE_SECRET,
			allowDangerousEmailAccountLinking: true,
		}),
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const parsedCredentials = z
					.object({
						email: z.string().email(),
						password: z.string().min(6),
					})
					.safeParse(credentials);

				if (!parsedCredentials.success) {
					return null;
				}

				const { email, password } = parsedCredentials.data;
				const existingUser = await db
					.select()
					.from(users)
					.where(eq(users.email, email))
					.limit(1);

				if (existingUser.length === 0 || !existingUser[0]) {
					throw new Error("Invalid credentials");
				}

				const user = existingUser[0];
				if (!user.password) {
					throw new Error("Please use Google to sign in with this email");
				}

				const isPasswordValid = await verifyPassword(password, user.password);
				if (!isPasswordValid) {
					throw new Error("Invalid credentials");
				}
				return {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
					emailVerified: user.emailVerified,
				};
			},
		}),
	],
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens,
	}),
	session: {
		strategy: "jwt", // Use JWT for credentials provider
	},
	pages: {
		signIn: "/auth/signin",
		error: "/not-found",
	},
	trustHost: true,
	callbacks: {
		async jwt({ token, user, trigger }) {
			if (trigger === "update") {
				return { ...token, ...user };
			}
			return token;
		},
		session: async ({ session, token }) => {
			// Use token.sub (default JWT subject) if token.id is not available
			const userId = (token.id as string) || (token.sub as string);

			if (userId) {
				const userData = await db
					.select()
					.from(users)
					.where(eq(users.id, userId))
					.limit(1);

				if (userData.length > 0 && userData[0]) {
					session.user = {
						...session.user,
						id: userData[0].id,
						email: userData[0].email ?? "",
						name: userData[0].name ?? "",
						image: userData[0].image ?? "",
					};
				}
			}
			return session;
		},
		async signIn({ user }) {
			if (user?.email) {
				await ensureLoopsContact(user.email, {
					firstName: user.name?.split(" ")[0] ?? "",
					lastName: user.name?.split(" ")[1] ?? "",
				});
			}
			return true;
		},
	},
} satisfies NextAuthConfig;
