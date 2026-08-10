import { PrismaClient as CMSPrismaClient } from "@prisma/client-cms";

const globalForCMS = globalThis as unknown as {
  cmsDb: CMSPrismaClient | undefined;
};

const cmsUrl =
  process.env.CMS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_core?schema=public";

export const cmsDb =
  globalForCMS.cmsDb ??
  new CMSPrismaClient({
    datasources: {
      db: {
        url: cmsUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForCMS.cmsDb = cmsDb;
}

export default cmsDb;
