/**
 * Lazily-connected Drizzle client.
 *
 * Returns null when DATABASE_URL is unset, so the app runs fully local-first
 * with no database. API routes that need persistence check `getDb()` and
 * respond 503 when the cloud layer isn't provisioned yet.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!_db) {
    const sql = postgres(process.env.DATABASE_URL, { prepare: false });
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export { schema };
