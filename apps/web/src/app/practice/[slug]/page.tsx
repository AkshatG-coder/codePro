import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProblemIDE from "@/components/ProblemIDE";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.problem.findUnique({ where: { slug }, select: { title: true } });
  return { title: p?.title ?? "Problem" };
}

export default async function PracticeProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({
    where: { slug, hidden: false },
    include: { defaultCodes: { select: { languageId: true, code: true } } },
  });
  if (!problem) notFound();

  return (
    <ProblemIDE
      problem={{
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        defaultCodes: problem.defaultCodes,
      }}
    />
  );
}
