import { PrismaClient as CMSPrismaClient } from "@prisma/client-cms";

const globalForCMS = globalThis as unknown as {
  cmsDb: CMSPrismaClient | undefined;
};

function createCmsClient() {
  const envUrl =
    process.env.CORE_DATABASE_URL ||
    process.env.CMS_DATABASE_URL ||
    "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_core?schema=public";

  return new CMSPrismaClient({
    datasources: {
      db: {
        url: envUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const cmsDb = globalForCMS.cmsDb ?? createCmsClient();

if (process.env.NODE_ENV !== "production") {
  globalForCMS.cmsDb = cmsDb;
}

export default cmsDb;
