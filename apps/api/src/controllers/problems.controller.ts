import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export async function getProblems(_req: Request, res: Response, next: NextFunction) {
  try {
    const problems = await prisma.problem.findMany({
      where: { hidden: false },
      select: { id: true, slug: true, title: true, difficulty: true, tags: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: problems });
  } catch (err) {
    return next(err);
  }
}

export async function getProblem(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const problem = await prisma.problem.findUnique({
      where: { slug, hidden: false },
      include: {
        defaultCodes: true,
        testCases: { where: { isHidden: false }, select: { id: true, input: true, expectedOutput: true } },
      },
    });
    if (!problem) return next(new AppError(404, "Problem not found"));
    return res.json({ success: true, data: problem });
  } catch (err) {
    return next(err);
  }
}

export async function createProblem(req: Request, res: Response, next: NextFunction) {
  try {
    const problem = await prisma.problem.create({ data: req.body });
    return res.status(201).json({ success: true, data: problem });
  } catch (err) {
    return next(err);
  }
}
