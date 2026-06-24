import { notFound } from "next/navigation";
import { getLesson } from "@/lib/curriculum";
import { LessonView } from "@/components/lessons/lesson-view";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  return <LessonView id={id} />;
}
