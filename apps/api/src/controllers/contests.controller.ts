
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export async function getContests(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const contests = await prisma.contest.findMany({
      where: { hidden: false },
      orderBy: { startTime: "desc" },
    });
    const active = contests.filter(c => c.startTime <= now && c.endTime >= now);
    const upcoming = contests.filter(c => c.startTime > now);
    const past = contests.filter(c => c.endTime < now);
    return res.json({ success: true, data: { active, upcoming, past } });
  } catch (err) {
    return next(err);
  }
}

export async function getContest(req: Request, res: Response, next: NextFunction) {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id, hidden: false },
      include: {
        contestProblems: {
          include: { problem: { select: { id: true, slug: true, title: true, difficulty: true } } },
          orderBy: { order: "asc" },
        },
      },
    });
    if (!contest) return next(new AppError(404, "Contest not found"));
    return res.json({ success: true, data: contest });
  } catch (err) {
    return next(err);
  }
}

export async function getContestProblems(req: Request, res: Response, next: NextFunction) {
  try {
    const contestProblems = await prisma.contestProblem.findMany({
      where: { contestId: req.params.id },
      include: { problem: { select: { id: true, slug: true, title: true, difficulty: true, description: true } } },
      orderBy: { order: "asc" },
    });
    return res.json({ success: true, data: contestProblems });
  } catch (err) {
    return next(err);
  }
}
