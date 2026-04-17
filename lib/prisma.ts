import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Only initialize Prisma if DATABASE_URL is provided
const shouldUsePrisma = !!process.env.DATABASE_URL;

export const prisma = shouldUsePrisma
  ? (globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    }))
  : (null as any);

if (process.env.NODE_ENV !== "production" && shouldUsePrisma && globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Helper function to check database connection
export async function checkDatabaseConnection() {
  if (!prisma) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
