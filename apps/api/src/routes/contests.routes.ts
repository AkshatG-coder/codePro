import { Router } from "express";
import {
  getContests,
  getContest,
  getContestProblems,
} from "../controllers/contests.controller";

export const contestsRouter = Router();

contestsRouter.get("/", getContests);
contestsRouter.get("/:id", getContest);
contestsRouter.get("/:id/problems", getContestProblems);
