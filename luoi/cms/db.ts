import { PrismaClient as CMSPrismaClient } from "@prisma/client-cms";
import path from "path";

function getCmsDatabaseUrl() {
  if (process.env.CMS_DATABASE_URL) {
    return process.env.CMS_DATABASE_URL;
  }
  const dbPath = path.resolve(process.cwd(), "luoi", "cms", "cms.db");
  return `file:${dbPath}`;
}

const globalForCMS = globalThis as unknown as {
  cmsDb: CMSPrismaClient | undefined;
};

export const cmsDb =
  globalForCMS.cmsDb ??
  new CMSPrismaClient({
    datasources: {
      db: {
        url: getCmsDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForCMS.cmsDb = cmsDb;
}

export default cmsDb;
