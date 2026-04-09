import { Router } from "express";
import { authRouter } from "./auth.routes";
import { problemsRouter } from "./problems.routes";
import { contestsRouter } from "./contests.routes";
import { submissionsRouter } from "./submissions.routes";
import { leaderboardRouter } from "./leaderboard.routes";

export const router = Router();

router.use("/auth", authRouter);
router.use("/problems", problemsRouter);
router.use("/contests", contestsRouter);
router.use("/submissions", submissionsRouter);
router.use("/leaderboard", leaderboardRouter);
