import { PrismaClient as CMSPrismaClient } from "@prisma/client-cms";

const globalForCMS = globalThis as unknown as {
  cmsDb: CMSPrismaClient | undefined;
};

export const cmsDb =
  globalForCMS.cmsDb ??
  new CMSPrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForCMS.cmsDb = cmsDb;
}

export default cmsDb;
