import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `internshipshq_${name}`);

export const users = createTable("user", (d) => ({
	id: d
		.varchar("id", { length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.text("name"),
	email: d.text("email").notNull().unique(),
	emailVerified: d
		.timestamp("email_verified", {
			mode: "date",
			withTimezone: true,
		})
		.default(sql`CURRENT_TIMESTAMP`),
	image: d.text("image"),
	password: d.varchar("password", { length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
}));

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d
			.varchar("user_id", { length: 255 })
			.notNull()
			.references(() => users.id),
		type: d
			.varchar("type", { length: 255 })
			.$type<AdapterAccount["type"]>()
			.notNull(),
		provider: d.varchar("provider", { length: 255 }).notNull(),
		providerAccountId: d
			.varchar("provider_account_id", { length: 255 })
			.notNull(),
		refresh_token: d.text("refresh_token"),
		access_token: d.text("access_token"),
		expires_at: d.integer("expires_at"),
		token_type: d.varchar("token_type", { length: 255 }),
		scope: d.varchar("scope", { length: 255 }),
		id_token: d.text("id_token"),
		session_state: d.varchar("session_state", { length: 255 }),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
	],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	"session",
	(d) => ({
		sessionToken: d
			.varchar("session_token", { length: 255 })
			.notNull()
			.primaryKey(),
		userId: d
			.varchar("user_id", { length: 255 })
			.notNull()
			.references(() => users.id),
		expires: d
			.timestamp("expires", { mode: "date", withTimezone: true })
			.notNull(),
	}),
	(t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.varchar("identifier", { length: 255 }).notNull(),
		token: d.varchar("token", { length: 255 }).notNull(),
		expires: d
			.timestamp("expires", { mode: "date", withTimezone: true })
			.notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
