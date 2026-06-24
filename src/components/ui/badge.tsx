import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "accent" | "success" | "info" | "muted";

const tones: Record<Tone, string> = {
  default: "bg-surface-3 text-text border-border",
  accent: "bg-accent/15 text-accent border-accent/30",
  success: "bg-success/15 text-success border-success/30",
  info: "bg-info/15 text-info border-info/30",
  muted: "bg-surface-2 text-muted border-border",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
