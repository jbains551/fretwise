import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="1.5" y="1.5" width="25" height="25" rx="8" className="fill-accent" />
        {/* six strings */}
        {[6, 9.6, 13.2, 16.8, 20.4, 24].map((x, i) => (
          <line
            key={i}
            x1={x - 2}
            y1="5"
            x2={x - 2}
            y2="23"
            stroke="hsl(var(--accent-fg))"
            strokeOpacity={0.55}
            strokeWidth={i % 2 ? 0.9 : 1.3}
          />
        ))}
        {/* two frets */}
        <line x1="4" y1="11" x2="24" y2="11" stroke="hsl(var(--accent-fg))" strokeOpacity={0.4} strokeWidth="1" />
        <line x1="4" y1="17" x2="24" y2="17" stroke="hsl(var(--accent-fg))" strokeOpacity={0.4} strokeWidth="1" />
        {/* fingered dot */}
        <circle cx="10" cy="14" r="2.1" fill="hsl(var(--accent-fg))" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">Fretwise</span>
    </span>
  );
}
