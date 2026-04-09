import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required"));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      role: string;
    };
    req.userId = payload.userId;
    req.userRole = payload.role;
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired token"));
  }
}

export function requireAdmin(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  if (req.userRole !== "ADMIN") {
    return next(new AppError(403, "Admin access required"));
  }
  return next();
}
