import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
	pool: Pool | undefined;
};

// Detect if this is a local database connection
const isLocalDatabase = (connectionString: string): boolean => {
	try {
		const url = new URL(connectionString);
		const hostname = url.hostname;
		return (
			hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
		);
	} catch {
		return false;
	}
};

const pool =
	globalForDb.pool ??
	new Pool({
		connectionString: env.DATABASE_URL,
		// Only enable SSL for remote databases (e.g., PlanetScale, cloud providers)
		// Local PostgreSQL typically doesn't have SSL enabled
		ssl: isLocalDatabase(env.DATABASE_URL)
			? false
			: { rejectUnauthorized: false },
	});

if (env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
