/**
 * User identity for the sync API — backed by Clerk.
 *
 * `auth()` reads the signed-in user from the request (attached by the Clerk
 * proxy in `src/proxy.ts`). Returns null when signed out, so `/api/sync`
 * responds 401 and the app falls back to its local-first behavior.
 */

import { auth } from "@clerk/nextjs/server";

export async function getUserId(_req: Request): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
