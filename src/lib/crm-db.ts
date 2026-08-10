import path from "path";
import { PrismaClient as CRMPrismaClientSQLite } from "@prisma/client-crm-sqlite";
import { PrismaClient as CRMPrismaClientPG } from "@prisma/client-crm-pg";

const globalForCRM = globalThis as unknown as {
  crmDb: CRMPrismaClientSQLite | undefined;
};

function createCrmClient() {
  const envUrl = process.env.CRM_DATABASE_URL || process.env.CRM_POSTGRES_URL;

  if (envUrl && envUrl.startsWith("postgresql://")) {
    return new CRMPrismaClientPG({
      datasources: {
        db: {
          url: envUrl,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    }) as unknown as CRMPrismaClientSQLite;
  }

  const absoluteDbPath = path.resolve(process.cwd(), "prisma", "minicrm.db");
  const sqliteUrl = envUrl && envUrl.startsWith("file:") ? envUrl : `file:${absoluteDbPath}`;

  return new CRMPrismaClientSQLite({
    datasources: {
      db: {
        url: sqliteUrl,
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
