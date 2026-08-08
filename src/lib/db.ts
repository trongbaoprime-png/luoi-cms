import { PrismaClient as DefaultPrismaClient } from "@prisma/client";
import cmsDb from "./cms-db";
import crmDb from "./crm-db";
import omniDb, { omnichannelDb } from "./omni-db";

const globalForPrisma = globalThis as unknown as {
  prisma: DefaultPrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new DefaultPrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

export { cmsDb, crmDb, omniDb, omnichannelDb };

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
