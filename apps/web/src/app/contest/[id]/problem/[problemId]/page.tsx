import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProblemIDE from "@/components/ProblemIDE";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; problemId: string }>;
}): Promise<Metadata> {
  const { problemId } = await params;
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { title: true },
  });
  return { title: problem?.title ?? "Problem" };
}

export default async function ContestProblemPage({
  params,
}: {
  params: Promise<{ id: string; problemId: string }>;
}) {
  const { id: contestId, problemId } = await params;

  const problem = await prisma.problem.findUnique({
    where: { id: problemId, hidden: false },
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
      contestId={contestId}
    />
  );
}
