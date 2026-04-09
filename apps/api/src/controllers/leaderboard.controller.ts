import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { contestId } = req.params;
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) return next(new AppError(404, "Contest not found"));

    const standings = await prisma.contestPoints.findMany({
      where: { contestId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { totalPoints: "desc" },
    });

    // Assign ranks
    const ranked = standings.map((entry, index) => ({
      rank: index + 1,
      user: entry.user,
      totalPoints: entry.totalPoints,
    }));

    return res.json({ success: true, data: { contest, standings: ranked } });
  } catch (err) {
    return next(err);
  }
}
