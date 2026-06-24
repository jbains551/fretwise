"use client";

import Link from "next/link";
import { Check, Clock, ChevronRight, Circle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CURRICULUM, TOTAL_LESSONS } from "@/lib/curriculum";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function LessonsPage() {
  const progress = useStore((s) => s.lessonProgress);
  const completed = Object.keys(progress).length;
  const pct = Math.round((completed / TOTAL_LESSONS) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Lessons"
        subtitle="A guided path from first chords to barre chords and scales. Go at your own pace."
      />

      <Card className="mb-6 p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-lg font-semibold">Your progress</span>
          <span className="text-sm text-muted">
            {completed} / {TOTAL_LESSONS} lessons
          </span>
        </div>
        <Progress value={pct} />
      </Card>

      <div className="space-y-7">
        {CURRICULUM.map((unit) => {
          const unitDone = unit.lessons.filter((l) => progress[l.id]).length;
          return (
            <section key={unit.id}>
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl">{unit.emoji}</span>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-semibold tracking-tight">{unit.title}</h2>
                  <p className="text-sm text-muted">{unit.subtitle}</p>
                </div>
                <Badge tone={unitDone === unit.lessons.length ? "success" : "muted"}>
                  {unitDone}/{unit.lessons.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {unit.lessons.map((lesson) => {
                  const done = !!progress[lesson.id];
                  return (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                      <Card className="flex items-center gap-3 p-3.5 transition hover:border-accent/40 hover:bg-surface-2">
                        <span
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                            done ? "bg-success text-white" : "bg-surface-3 text-muted",
                          )}
                        >
                          {done ? <Check size={16} /> : <Circle size={14} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{lesson.title}</div>
                          <div className="flex items-center gap-1 text-xs text-muted">
                            <Clock size={12} /> {lesson.minutes} min
                          </div>
                        </div>
                        <ChevronRight size={18} className="shrink-0 text-muted" />
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
