import { aiConfigured, weeklyDigest } from "@/lib/ai";

export async function POST(req: Request) {
  if (!aiConfigured()) {
    return Response.json(
      { error: "AI not configured. Set ANTHROPIC_API_KEY to enable the weekly digest." },
      { status: 503 },
    );
  }
  try {
    const { sessions = [], songs = [] } = await req.json();
    const summary = await weeklyDigest({ sessions, songs });
    return Response.json({ summary });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Digest failed." },
      { status: 500 },
    );
  }
}
