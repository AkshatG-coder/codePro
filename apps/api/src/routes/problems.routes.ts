import { Router } from "express";

import {
  getProblems,
  getProblem,
  createProblem,
} from "../controllers/problems.controller";
import { authenticate, requireAdmin } from "../middleware/auth";

export const problemsRouter = Router();

problemsRouter.get("/", getProblems);
problemsRouter.get("/:slug", getProblem);
problemsRouter.post("/", authenticate, requireAdmin, createProblem);
