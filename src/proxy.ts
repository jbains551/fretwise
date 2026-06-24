// Next.js 16 renamed `middleware` → `proxy`. Clerk attaches auth to every
// request so route handlers can call `auth()`. Nothing is force-protected —
// the app stays usable signed-out (local-first); only /api/sync requires a user.
import { clerkMiddleware } from "@clerk/nextjs/server";

export const proxy = clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run on API routes
    "/(api|trpc)(.*)",
  ],
};
