import { Router } from "express";
import { getLeaderboard } from "../controllers/leaderboard.controller";

export const leaderboardRouter = Router();

leaderboardRouter.get("/:contestId", getLeaderboard);
