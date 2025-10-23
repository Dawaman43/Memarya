import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authschema from "../../auth-schema"; // corrected path to project root
import * as schema from "./schema";

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please configure it in your environment."
  );
}

// Reuse a single Pool in dev to avoid exhausting connections on HMR
const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool =
  globalForPg.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPg.__pgPool = pool;

export const db = drizzle(pool, {
  schema: {
    ...authschema,
    ...schema,
  },
});
