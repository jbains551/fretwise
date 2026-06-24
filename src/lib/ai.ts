/**
 * Claude-powered helpers for Fretwise.
 *
 * Two single-shot calls, both env-gated on ANTHROPIC_API_KEY:
 *   1. enrichPracticeText — turn a free journal entry into structured fields.
 *   2. weeklyDigest       — summarize recent sessions and flag what to work on.
 *
 * Model defaults to claude-sonnet-4-6 (cost-appropriate for these frequent,
 * lightweight calls — the figure specified in the original project SPEC).
 * Override with FRETWISE_AI_MODEL.
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.FRETWISE_AI_MODEL ?? "claude-sonnet-4-6";

export function aiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function client() {
  return new Anthropic(); // reads ANTHROPIC_API_KEY from env
}

export interface EnrichResult {
  durationMin?: number;
  mood?: number;
  energy?: number;
  summary?: string;
  songs?: { title: string; artist?: string; bpm?: number }[];
  exercises?: { name: string; category?: string; bpm?: number }[];
  tags?: string[];
}

const ENRICH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    durationMin: { type: "integer" },
    mood: { type: "integer" },
    energy: { type: "integer" },
    summary: { type: "string" },
    songs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          artist: { type: "string" },
          bpm: { type: "integer" },
        },
        required: ["title"],
      },
    },
    exercises: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          category: {
            type: "string",
            enum: ["scale", "arpeggio", "chord_change", "picking", "strumming", "ear", "theory", "other"],
          },
          bpm: { type: "integer" },
        },
        required: ["name"],
      },
    },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["summary"],
} as const;

export async function enrichPracticeText(text: string): Promise<EnrichResult> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "disabled" },
    output_config: { effort: "low", format: { type: "json_schema", schema: ENRICH_SCHEMA } },
    system:
      "You extract structured practice data from a guitar student's free-form journal entry. " +
      "Pull out total practice minutes, songs worked on (with any BPM mentioned), technique exercises " +
      "(categorize each), mood and energy on a 1-5 scale if implied, relevant technique tags, and a one-line cleaned summary. " +
      "Only include fields the text actually supports — do not invent details.",
    messages: [{ role: "user", content: text }],
  });

  const block = res.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return { summary: text };
  try {
    return JSON.parse(block.text) as EnrichResult;
  } catch {
    return { summary: text };
  }
}

interface DigestInput {
  sessions: {
    startedAt: string;
    durationMin?: number;
    notes?: string;
    rawText?: string;
    mood?: number;
    tags?: string[];
  }[];
  songs: { title: string; artist?: string; status: string }[];
}

export async function weeklyDigest(input: DigestInput): Promise<string> {
  const lines = input.sessions
    .map((s) => {
      const d = new Date(s.startedAt).toISOString().slice(0, 10);
      return `- ${d} · ${s.durationMin ?? "?"}min · ${s.notes ?? s.rawText ?? ""}`.trim();
    })
    .join("\n");
  const songs = input.songs.map((s) => `${s.title}${s.artist ? ` (${s.artist})` : ""} — ${s.status}`).join("; ");

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 700,
    thinking: { type: "disabled" },
    output_config: { effort: "low" },
    system:
      "You are an encouraging but honest guitar instructor writing a short weekly progress digest for a beginner student. " +
      "In 150-250 words: celebrate what they worked on and any measurable progress (consistency, BPM gains), " +
      "then gently flag what's been neglected and suggest 1-2 concrete focus areas for next week. " +
      "Warm, specific, second person. No preamble — start with the summary.",
    messages: [
      {
        role: "user",
        content: `Recent practice sessions:\n${lines || "(none)"}\n\nSongs in progress: ${songs || "(none)"}`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "No summary available.";
}
