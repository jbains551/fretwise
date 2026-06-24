"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Target,
  Guitar,
  Timer,
  Plus,
  Flame,
  Clock,
  BookOpen,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ring } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LogDialog } from "@/components/tracker/log-dialog";
import { useStore, useStreak, useTodayMinutes, totalMinutes } from "@/lib/store";
import { firstIncomplete, TOTAL_LESSONS } from "@/lib/curriculum";
import { formatMinutes } from "@/lib/utils";

const TIPS = [
  "Practice slow enough to play it perfectly — speed is a side effect of accuracy.",
  "Five focused minutes beats an hour of distracted noodling. Show up daily.",
  "Sore fingertips are normal and temporary. Calluses are coming.",
  "Name the chord out loud as you change to it — it cements the shape.",
  "Record yourself once a week. Your ears improve faster than your fingers.",
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const [logOpen, setLogOpen] = useState(false);
  const { user } = useUser();
  const firstName = user?.firstName;
  const streak = useStreak();
  const todayMin = useTodayMinutes();
  const goal = useStore((s) => s.settings.goal.dailyMinutes);
  const sessions = useStore((s) => s.sessions);
  const songs = useStore((s) => s.songs);
  const progress = useStore((s) => s.lessonProgress);

  const lessonsDone = Object.keys(progress).length;
  const nextL = firstIncomplete(progress);
  const goalPct = Math.min(100, (todayMin / goal) * 100);
  const tip = TIPS[new Date().getDate() % TIPS.length];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to play?
          </h1>
        </div>
        <Button size="lg" onClick={() => setLogOpen(true)} className="shrink-0">
          <Plus size={18} /> Log practice
        </Button>
      </div>

      {/* Today snapshot */}
      <Card className="mb-4 overflow-hidden">
        <CardBody className="flex flex-col items-center gap-6 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <Ring value={goalPct} size={96} stroke={9}>
              <div className="text-center">
                <div className="font-display text-xl font-semibold tabular leading-none">{todayMin}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted">/ {goal}m</div>
              </div>
            </Ring>
            <div>
              <div className="text-sm text-muted">Today&apos;s goal</div>
              <div className="font-display text-lg font-semibold">
                {goalPct >= 100 ? "Hit it! 🎉" : `${Math.max(0, goal - todayMin)} min to go`}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm">
                <Flame size={15} className={streak > 0 ? "text-ember" : "text-muted"} />
                <span className="font-semibold tabular">{streak}</span>
                <span className="text-muted">day streak</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 text-center">
            <Stat label="Practiced" value={formatMinutes(totalMinutes(sessions))} />
            <Stat label="Lessons" value={`${lessonsDone}/${TOTAL_LESSONS}`} />
            <Stat label="Songs" value={String(songs.length)} />
          </div>
        </CardBody>
      </Card>

      {/* Continue learning */}
      <Link href={`/lessons/${nextL.id}`}>
        <Card className="mb-4 transition hover:border-accent/40">
          <CardBody className="flex items-center gap-4 pt-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
              <BookOpen size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                {lessonsDone === 0 ? "Start here" : "Continue learning"}
              </div>
              <div className="truncate font-display text-lg font-semibold">{nextL.title}</div>
              <div className="text-sm text-muted">{nextL.unitTitle} · {nextL.minutes} min</div>
            </div>
            <ChevronRight size={20} className="shrink-0 text-muted" />
          </CardBody>
        </Card>
      </Link>

      {/* Quick actions */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickTile href="/lessons" icon={GraduationCap} label="Lessons" tone="text-accent" />
        <QuickTile href="/practice" icon={Target} label="Practice" tone="text-ember" />
        <QuickTile href="/metronome" icon={Timer} label="Metronome" tone="text-info" />
        <QuickTile href="/fretboard" icon={Guitar} label="Fretboard" tone="text-success" />
      </div>

      {/* Tip of the day */}
      <Card>
        <CardBody className="flex items-start gap-3 pt-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-accent">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Tip of the day</div>
            <p className="text-sm leading-relaxed text-text/90">{tip}</p>
          </div>
        </CardBody>
      </Card>

      {/* Recent */}
      {sessions.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent practice</h2>
            <Link href="/tracker" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 3).map((s) => (
              <Card key={s.id}>
                <CardBody className="flex items-center gap-3 py-3.5">
                  <Clock size={16} className="shrink-0 text-muted" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{s.notes || "Practice session"}</div>
                    <div className="text-xs text-muted">
                      {new Date(s.startedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                  </div>
                  {s.durationMin ? <Badge tone="muted">{s.durationMin}m</Badge> : null}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      <LogDialog open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-xl font-semibold tabular">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function QuickTile({
  href,
  icon: Icon,
  label,
  tone,
}: {
  href: string;
  icon: typeof Target;
  label: string;
  tone: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex flex-col items-center gap-2 p-4 transition hover:border-accent/40 hover:bg-surface-2">
        <Icon size={24} className={tone} />
        <span className="text-sm font-medium">{label}</span>
      </Card>
    </Link>
  );
}
