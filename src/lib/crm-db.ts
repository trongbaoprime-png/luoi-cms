import path from "path";
import { PrismaClient as CRMPrismaClient } from "@prisma/client-crm";

const globalForCRM = globalThis as unknown as {
  crmDb: CRMPrismaClient | undefined;
};

function getCrmDatabaseUrl() {
  const envUrl = process.env.CRM_DATABASE_URL;
  if (envUrl && envUrl.startsWith("postgresql")) {
    return envUrl;
  }
  const absoluteDbPath = path.resolve(process.cwd(), "prisma", "minicrm.db");
  return `file:${absoluteDbPath}`;
}

export const crmDb =
  globalForCRM.crmDb ??
  new CRMPrismaClient({
    datasources: {
      db: {
        url: getCrmDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForCRM.crmDb = crmDb;
}

export default crmDb;
