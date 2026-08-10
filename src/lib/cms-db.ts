import path from "path";
import { PrismaClient as CMSPrismaClient } from "@prisma/client-cms";

const globalForCMS = globalThis as unknown as {
  cmsDb: CMSPrismaClient | undefined;
};

function getCmsDatabaseUrl() {
  const envUrl = process.env.CMS_DATABASE_URL;
  if (envUrl && envUrl.startsWith("file:")) {
    const relPath = envUrl.replace(/^file:/, "");
    const absPath = path.resolve(process.cwd(), relPath);
    return `file:${absPath}`;
  }
  const absoluteDbPath = path.resolve(process.cwd(), "prisma", "luoi-cms.db");
  return `file:${absoluteDbPath}`;
}

export const cmsDb =
  globalForCMS.cmsDb ??
  new CMSPrismaClient({
    datasources: {
      db: {
        url: getCmsDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForCMS.cmsDb = cmsDb;
}

export default cmsDb;
