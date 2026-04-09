import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { submitBatch } from "../lib/judge0";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

export async function createSubmission(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { problemId, contestId, code, languageId } = req.body;
    const userId = req.userId!;

    // Fetch the full boilerplate to wrap user code
    const boilerplate = await prisma.fullBoilerplate.findUnique({
      where: { problemId_languageId: { problemId, languageId } },
    });
    if (!boilerplate) return next(new AppError(400, "No boilerplate for this language"));

    const fullCode = boilerplate.code.replace("{{USER_CODE}}", code);

    // Fetch hidden test cases
    const testCases = await prisma.testCase.findMany({ where: { problemId } });
    if (!testCases.length) return next(new AppError(400, "No test cases found for problem"));

    // Create pending submission
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId,
        code,
        languageId,
        status: "PENDING",
        submissionTestCases: {
          create: testCases.map((tc) => ({
            testCaseId: tc.id,
            status: "PENDING",
          })),
        },
      },
      include: { submissionTestCases: true },
    });

    // Submit batch to Judge0
    const judge0Payloads = testCases.map((tc) => ({
      source_code: fullCode,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.expectedOutput,
    }));

    const tokens = await submitBatch(judge0Payloads);

    // Store Judge0 tokens on each SubmissionTestCase
    await Promise.all(
      submission.submissionTestCases.map((stc, index) =>
        prisma.submissionTestCase.update({
          where: { id: stc.id },
          data: { judge0TrackingId: tokens[index].token },
        })
      )
    );

    // If this is a contest submission, record it
    if (contestId) {
      await prisma.contestSubmission.create({
        data: {
          contestId,
          submissionId: submission.id,
          userId,
          problemId,
          score: 0,
        },
      });
    }

    return res.status(201).json({ success: true, data: { submissionId: submission.id } });
  } catch (err) {
    return next(err);
  }
}

export async function getSubmissionStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        submissionTestCases: {
          include: { testCase: { select: { input: true, expectedOutput: true, isHidden: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!submission) return next(new AppError(404, "Submission not found"));
    if (submission.userId !== req.userId) return next(new AppError(403, "Forbidden"));

    return res.json({ success: true, data: submission });
  } catch (err) {
    return next(err);
  }
}

export async function getUserSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const submissions = await prisma.submission.findMany({
      where: { problemId: req.params.problemId, userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, status: true, languageId: true, time: true, memory: true, createdAt: true },
    });
    return res.json({ success: true, data: submissions });
  } catch (err) {
    return next(err);
  }
}
