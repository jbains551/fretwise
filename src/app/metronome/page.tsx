import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { MetronomePanel } from "@/components/metronome";

export const metadata = { title: "Metronome · Fretwise" };

export default function MetronomePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Metronome" subtitle="Steady time is the most important skill you'll build." />
      <Card className="p-8">
        <MetronomePanel />
      </Card>
      <p className="mt-4 text-center text-sm text-muted">
        Tip: practice new material slow enough to play it perfectly, then nudge the tempo up 5 BPM at a time.
      </p>
    </div>
  );
}
