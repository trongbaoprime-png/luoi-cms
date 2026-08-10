import { PrismaClient as CRMPrismaClient } from "@prisma/client-crm";

const globalForCRM = globalThis as unknown as {
  crmDb: CRMPrismaClient | undefined;
};

const crmUrl =
  process.env.CRM_DATABASE_URL ||
  process.env.CRM_POSTGRES_URL ||
  "postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_crm?schema=public";

export const crmDb =
  globalForCRM.crmDb ??
  new CRMPrismaClient({
    datasources: {
      db: {
        url: crmUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForCRM.crmDb = crmDb;
}

export default crmDb;
