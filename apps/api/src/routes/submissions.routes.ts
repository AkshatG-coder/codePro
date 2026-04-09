
import { Router } from "express";
import {
  createSubmission,
  getSubmissionStatus,
  getUserSubmissions,
} from "../controllers/submissions.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

export const submissionsRouter = Router();

const submitSchema = z.object({
  problemId: z.string(),
  contestId: z.string().optional(),
  code: z.string().min(1),
  languageId: z.number().int(),
});

submissionsRouter.post("/", authenticate, validate(submitSchema), createSubmission);
submissionsRouter.get("/:id/status", authenticate, getSubmissionStatus);
submissionsRouter.get("/problem/:problemId", authenticate, getUserSubmissions);
