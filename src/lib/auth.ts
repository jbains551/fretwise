/**
 * User identity for the sync API.
 *
 * Local-first by default: every request maps to a single "local" user. When you
 * add Clerk (see README), replace the body of `getUserId` with:
 *
 *   import { auth } from "@clerk/nextjs/server";
 *   const { userId } = await auth();
 *   return userId;
 *
 * The client sends its Clerk session automatically once ClerkProvider wraps the
 * app, so no other change is needed here.
 */

export async function getUserId(req: Request): Promise<string | null> {
  // Until Clerk is wired up, allow an explicit header for testing, else "local".
  const header = req.headers.get("x-user-id");
  return header || "local";
}
