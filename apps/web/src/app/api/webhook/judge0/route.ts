import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

// Map Judge0 status_id to our SubmissionStatus enum
function mapStatus(statusId: number): string {
  switch (statusId) {
    case 3:
      return "AC"; // Accepted
    case 4:
      return "WA"; // Wrong Answer
    case 5:
      return "TLE"; // Time Limit Exceeded
    case 6:
      return "CE"; // Compilation Error
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return "RE"; // Runtime Error
    case 13:
      return "SE"; // Internal Error
    case 14:
      return "SE"; // Exec Format Error
    default:
      return "PENDING";
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const submissionTestCaseId = url.searchParams.get("submissionTestCaseId");
    const submissionId = url.searchParams.get("submissionId");
    const token = url.searchParams.get("token");

    if (!submissionTestCaseId || !submissionId || !token) {
      return NextResponse.json({ error: "Missing query parameters" }, { status: 400 });
    }

    const expectedToken = process.env.JUDGE0_CALLBACK_SECRET || "default_unsafe_secret";
    if (token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized: Invalid webhook token" }, { status: 401 });
    }

    const body = await req.json();

    // Body contains the result of the execution from Judge0
    const statusId = body.status?.id;
    if (!statusId) {
      return NextResponse.json({ error: "Missing status id in body" }, { status: 400 });
    }

    // Judge0: 1=In Queue, 2=Processing. We only care about final results.
    if (statusId <= 2) {
      return NextResponse.json({ success: true, message: "Still processing" });
    }

    const mappedStatus = mapStatus(statusId);

    // Update SubmissionTestCase
    await prisma.submissionTestCase.update({
      where: { id: submissionTestCaseId },
      data: {
        status: mappedStatus as "AC" | "WA" | "TLE" | "CE" | "RE" | "SE" | "MLE" | "PENDING",
        time: body.time ? parseFloat(body.time) : null,
        memory: body.memory ? body.memory / 1024 : null, // KB to MB
        stderr: body.stderr,
        compileOutput: body.compile_output,
      },
    });

    // Finalize submission if all test cases are complete
    await finalizeSubmissionIfComplete(submissionId);

    // Publish update event to Redis Pub/Sub so SSE clients get notified immediately
    await redis.publish(`submission:${submissionId}`, JSON.stringify({ event: "update" }));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Webhook error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function finalizeSubmissionIfComplete(submissionId: string) {
  const allTestCases = await prisma.submissionTestCase.findMany({
    where: { submissionId },
    select: { status: true, time: true, memory: true },
  });

  // If any are still pending, skip
  const stillPending = allTestCases.some((tc) => tc.status === "PENDING");
  if (stillPending) return;

  // Determine final status
  const allAC = allTestCases.every((tc) => tc.status === "AC");
  const finalStatus = allAC
    ? "AC"
    : allTestCases.find((tc) => tc.status === "SE")
      ? "SE"
      : allTestCases.find((tc) => tc.status === "CE")
        ? "CE"
        : allTestCases.find((tc) => tc.status === "TLE")
          ? "TLE"
          : allTestCases.find((tc) => tc.status === "MLE")
            ? "MLE"
            : allTestCases.find((tc) => tc.status === "RE")
              ? "RE"
              : "WA";

  const times = allTestCases.filter((t) => t.time != null).map((t) => t.time as number);
  const mems = allTestCases.filter((t) => t.memory != null).map((t) => t.memory as number);

  const avgTime = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  const maxMem = mems.length ? Math.max(...mems) : null;

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: finalStatus as "AC" | "WA" | "TLE" | "CE" | "RE" | "SE" | "MLE", time: avgTime, memory: maxMem },
  });

  // Update contest points if this was an AC submission inside a contest
  if (finalStatus === "AC") {
    await updateContestPoints(submissionId);
  }
}

async function updateContestPoints(submissionId: string) {
  const contestSub = await prisma.contestSubmission.findUnique({
    where: { submissionId },
    include: { submission: true },
  });
  if (!contestSub) return;

  // Find the contest problem to get max points
  const contestProblem = await prisma.contestProblem.findUnique({
    where: {
      contestId_problemId: {
        contestId: contestSub.contestId,
        problemId: contestSub.problemId,
      },
    },
  });

  if (!contestProblem) return;

  // Only award points for the first AC on this problem
  const existingAC = await prisma.contestSubmission.findFirst({
    where: {
      contestId: contestSub.contestId,
      userId: contestSub.userId,
      problemId: contestSub.problemId,
      submissionId: { not: submissionId },
      submission: { status: "AC" },
    },
  });
  if (existingAC) return; // already awarded points

  // Award full points
  await prisma.contestSubmission.update({
    where: { submissionId },
    data: { score: contestProblem.points },
  });

  // Upsert ContestPoints totals
  await prisma.contestPoints.upsert({
    where: { contestId_userId: { contestId: contestSub.contestId, userId: contestSub.userId } },
    update: { totalPoints: { increment: contestProblem.points } },
    create: {
      contestId: contestSub.contestId,
      userId: contestSub.userId,
      totalPoints: contestProblem.points,
    },
  });
}
