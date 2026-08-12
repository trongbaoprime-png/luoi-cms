import { PrismaClient as CRMPrismaClientPG } from "@prisma/client-crm-pg";

const globalForCRM = globalThis as unknown as {
  crmDb: CRMPrismaClientPG | undefined;
};

function createCrmClient() {
  const envUrl =
    process.env.CRM_DATABASE_URL ||
    process.env.CRM_POSTGRES_URL ||
    "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_crm?schema=public";

  return new CRMPrismaClientPG({
    datasources: {
      db: {
        url: envUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const crmDb = globalForCRM.crmDb ?? createCrmClient();

if (process.env.NODE_ENV !== "production") {
  globalForCRM.crmDb = crmDb;
}

export default crmDb;
