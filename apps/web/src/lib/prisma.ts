import { prisma } from "@repo/db";

// Single shared Prisma client instance from @repo/db
export { prisma };
export default prisma;
export * from "@repo/db";

