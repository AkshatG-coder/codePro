import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const JUDGE0_URL = process.env.JUDGE0_API_URL ?? "http://localhost:2358";

async function submitBatch(payloads: any[]) {
  const res = await fetch(`${JUDGE0_URL}/submissions/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submissions: payloads }),
  });
  if (!res.ok) throw new Error("Judge0 batch submission failed");
  return res.json() as Promise<{ token: string }[]>;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { problemId, contestId, code, languageId } = await req.json();
    if (!problemId || !code || !languageId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get full boilerplate for this problem + language
    const boilerplate = await prisma.fullBoilerplate.findUnique({
      where: { problemId_languageId: { problemId, languageId } },
    });
    if (!boilerplate) {
      return NextResponse.json({ error: "No boilerplate found for this language" }, { status: 400 });
    }

    // 2. Enrich user code with the full boilerplate wrapper
    const fullCode = boilerplate.code.replace("{{USER_CODE}}", code);

    // 3. Fetch all test cases for the problem
    const testCases = await prisma.testCase.findMany({ where: { problemId } });
    if (!testCases.length) {
      return NextResponse.json({ error: "No test cases found" }, { status: 400 });
    }

    // 4. Create Submission with PENDING status
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        problemId,
        code,
        languageId,
        status: "PENDING",
        submissionTestCases: {
          create: testCases.map(tc => ({
            testCaseId: tc.id,
            status: "PENDING",
          })),
        },
      },
      include: { submissionTestCases: true },
    });

    // 5. Submit batch to Judge0 (fire-and-forget ordering — worker polls asynchronously)
    const judge0Payloads = testCases.map((tc: { input: string; expectedOutput: string }) => ({
      source_code: fullCode,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.expectedOutput,
    }));
    const tokens = await submitBatch(judge0Payloads);

    // 6. Save Judge0 tokens on each SubmissionTestCase
    await Promise.all(
      submission.submissionTestCases.map((stc: { id: string }, i: number) =>
        prisma.submissionTestCase.update({
          where: { id: stc.id },
          data: { judge0TrackingId: tokens[i]?.token },
        })
      )
    );

    // 7. If contest submission, record it
    if (contestId) {
      await prisma.contestSubmission.create({
        data: { contestId, submissionId: submission.id, userId: session.user.id, problemId, score: 0 },
      });
    }

    return NextResponse.json({ success: true, submissionId: submission.id }, { status: 201 });
  } catch (err: any) {
    console.error("Submission error:", err);
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 });
  }
}
