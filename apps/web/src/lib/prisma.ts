import { PrismaClient } from "@prisma/client";

// Single shared Prisma client instance for the entire app
export const prisma = new PrismaClient({ log: ["error"] });

export default prisma;
