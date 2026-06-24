"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lightbulb, Play, Target, ChevronRight, RotateCcw } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ChordDiagram } from "@/components/music/chord-diagram";
import { Fretboard } from "@/components/music/fretboard";
import { PracticeRunner } from "@/components/practice/practice-runner";
import { getLesson, nextLesson, type LessonStep, type PracticeSpec } from "@/lib/curriculum";
import { getChord } from "@/lib/music/chords";
import { SCALES } from "@/lib/music/scales";
import { pitchClassFromName } from "@/lib/music/notes";
import { useStore } from "@/lib/store";

export function LessonView({ id }: { id: string }) {
  const router = useRouter();
  const lesson = getLesson(id);
  const progress = useStore((s) => s.lessonProgress);
  const complete = useStore((s) => s.completeLesson);
  const uncomplete = useStore((s) => s.uncompleteLesson);
  const [runner, setRunner] = useState<PracticeSpec | null>(null);

  if (!lesson) return null;
  const done = !!progress[id];
  const next = nextLesson(id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/lessons" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft size={16} /> All lessons
      </Link>

      <div className="mb-2 flex items-center gap-2">
        <Badge tone="accent">{lesson.unitTitle}</Badge>
        <Badge tone="muted">{lesson.minutes} min</Badge>
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">{lesson.title}</h1>
      <p className="mt-2 text-muted">{lesson.summary}</p>

      {/* Goals */}
      <Card className="mt-5">
        <CardBody className="pt-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Target size={16} className="text-accent" /> By the end you'll be able to
          </div>
          <ul className="space-y-1.5">
            {lesson.goals.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <ChevronRight size={15} className="mt-0.5 shrink-0 text-accent" /> {g}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {/* Steps */}
      <div className="mt-6 space-y-4">
        {lesson.steps.map((step, i) => (
          <StepBlock key={i} step={step} onTry={setRunner} />
        ))}
      </div>

      {/* Complete */}
      <Card className="mt-8 p-5">
        {done ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge tone="success"><Check size={14} /> Lesson complete</Badge>
            {next ? (
              <Button onClick={() => router.push(`/lessons/${next.id}`)} className="w-full sm:w-auto">
                Next: {next.title} <ChevronRight size={16} />
              </Button>
            ) : (
              <p className="text-sm text-muted">🎉 You've reached the end of the path — keep practicing!</p>
            )}
            <button onClick={() => uncomplete(id)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-text">
              <RotateCcw size={12} /> Mark as not done
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted">Practiced it? Mark this lesson complete to track your progress.</p>
            <Button
              size="lg"
              onClick={() => {
                complete(id);
                if (next) setTimeout(() => router.push(`/lessons/${next.id}`), 400);
              }}
            >
              <Check size={18} /> Mark complete
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={!!runner} onClose={() => setRunner(null)} className="sm:max-w-xl">
        {runner && (
          <div className="pt-4">
            <PracticeRunner spec={runner} title="Practice" onClose={() => setRunner(null)} />
          </div>
        )}
      </Dialog>
    </div>
  );
}

function StepBlock({ step, onTry }: { step: LessonStep; onTry: (s: PracticeSpec) => void }) {
  if (step.kind === "text") {
    return (
      <div className="animate-rise">
        {step.title && <h3 className="mb-1 font-display text-lg font-semibold">{step.title}</h3>}
        <p className="leading-relaxed text-text/90">{step.body}</p>
      </div>
    );
  }

  if (step.kind === "tip") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-accent/25 bg-accent/10 p-4">
        <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-sm leading-relaxed">{step.body}</p>
      </div>
    );
  }

  if (step.kind === "chords") {
    return (
      <div>
        {step.body && <p className="mb-3 text-text/90">{step.body}</p>}
        <div className="flex flex-wrap justify-center gap-4 rounded-xl border border-border bg-surface-2 p-4">
          {step.ids.map((id) => {
            const c = getChord(id);
            return c ? <ChordDiagram key={id} chord={c} size={120} /> : null;
          })}
        </div>
      </div>
    );
  }

  if (step.kind === "scale") {
    const scale = SCALES[step.scaleId];
    const rootPc = pitchClassFromName(step.root);
    return (
      <div>
        {step.body && <p className="mb-3 text-text/90">{step.body}</p>}
        <Card className="p-3">
          <Fretboard rootPc={rootPc} scale={scale} mode="scale" maxFret={12} />
        </Card>
      </div>
    );
  }

  // try
  return (
    <div className="rounded-xl border border-ember/30 bg-ember/10 p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-ember">
        <Play size={15} /> Try it
      </div>
      <p className="mb-3 text-sm leading-relaxed">{step.body}</p>
      <Button variant="secondary" onClick={() => onTry(step.practice)}>
        <Play size={16} /> Start practice
      </Button>
    </div>
  );
}
