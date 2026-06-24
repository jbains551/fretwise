import { aiConfigured, enrichPracticeText } from "@/lib/ai";

export async function POST(req: Request) {
  if (!aiConfigured()) {
    return Response.json(
      { error: "AI not configured. Set ANTHROPIC_API_KEY to enable journal parsing." },
      { status: 503 },
    );
  }
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return Response.json({ error: "Missing 'text'." }, { status: 400 });
    }
    const data = await enrichPracticeText(text.slice(0, 4000));
    return Response.json({ data });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Enrichment failed." },
      { status: 500 },
    );
  }
}
