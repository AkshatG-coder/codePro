import { prisma } from "../lib/prisma";
import { pollTokens, mapStatus } from "../lib/judge0";

const POLL_INTERVAL_MS = 2000; // poll every 3 seconds

/**
 * Main worker loop:
 * 1. Find all PENDING SubmissionTestCases that have a Judge0 token
 * 2. Batch-poll Judge0 for their statuses
 * 3. Update DB accordingly
 * 4. If all test cases of a Submission are resolved, finalize the Submission
 */
export async function startWorker() {
  console.log(`⚙️  Polling Judge0 every ${POLL_INTERVAL_MS / 1000}s...`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await processPendingSubmissions();
    } catch (err) {
      console.error("Worker error:", err);
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

async function processPendingSubmissions() {
  // Get all pending test case results that have a Judge0 token
  const pendingTestCases = await prisma.submissionTestCase.findMany({
    where: { status: "PENDING", judge0TrackingId: { not: null } },
    select: {
      id: true,
      submissionId: true,
      judge0TrackingId: true,
      testCaseId: true,
    },
    take: 100, // process up to 100 at a time
  });

  if (!pendingTestCases.length) return;

  const tokens = pendingTestCases.map((tc) => tc.judge0TrackingId!);
  const results = await pollTokens(tokens);

  // Map token → result
  const resultMap = new Map(results.map((r) => [r.token, r]));

  // Process each result
  const updatedSubmissionIds = new Set<string>();

  for (const tc of pendingTestCases) {
    const result = resultMap.get(tc.judge0TrackingId!);
    if (!result) continue;

    const statusId = result.status.id;
    // Judge0: 1=In Queue, 2=Processing, 3+=final
    if (statusId <= 2) continue; // still running

    const status = mapStatus(statusId);
    await prisma.submissionTestCase.update({
      where: { id: tc.id },
      data: {
        status: status as any,
        time: result.time ? parseFloat(result.time) : null,
        memory: result.memory ? result.memory / 1024 : null, // KB → MB
        stderr: result.stderr,
        compileOutput: result.compile_output,
      },
    });

    updatedSubmissionIds.add(tc.submissionId);
  }

  // Finalize any submissions where all test cases are resolved
  for (const submissionId of updatedSubmissionIds) {
    await finalizeSubmissionIfComplete(submissionId);
  }
}

async function finalizeSubmissionIfComplete(submissionId: string) {
  const allTestCases = await prisma.submissionTestCase.findMany({
    where: { submissionId },
    select: { status: true },
  });

  // If any are still pending, skip
  const stillPending = allTestCases.some((tc) => tc.status === "PENDING");
  if (stillPending) return;

  // Determine final status: AC only if ALL are AC
  const allAC = allTestCases.every((tc) => tc.status === "AC");
  const finalStatus = allAC ? "AC" : (
    allTestCases.find((tc) => tc.status === "TLE") ? "TLE" :
    allTestCases.find((tc) => tc.status === "MLE") ? "MLE" :
    allTestCases.find((tc) => tc.status === "CE")  ? "CE"  :
    allTestCases.find((tc) => tc.status === "RE")  ? "RE"  : "WA"
  );

  // Compute avg time and memory
  const resolved = allTestCases as { status: string; time?: number | null; memory?: number | null }[];
  const times = (resolved as any[]).filter((t) => t.time != null).map((t) => t.time as number);
  const mems  = (resolved as any[]).filter((t) => t.memory != null).map((t) => t.memory as number);

  const avgTime  = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  const maxMem   = mems.length  ? Math.max(...mems) : null;

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: finalStatus as any, time: avgTime, memory: maxMem },
  });

  // Update contest points if this was an AC submission inside a contest
  if (finalStatus === "AC") {
    await updateContestPoints(submissionId);
  }

  console.log(`✅ Submission ${submissionId} finalized: ${finalStatus}`);
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
