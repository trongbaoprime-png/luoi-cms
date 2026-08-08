import { PrismaClient as CRMPrismaClient } from "@prisma/client-crm";
import path from "path";

function getCrmDatabaseUrl() {
  if (process.env.CRM_DATABASE_URL) {
    return process.env.CRM_DATABASE_URL;
  }
  const dbPath = path.resolve(process.cwd(), "luoi", "minicrm", "minicrm.db");
  return `file:${dbPath}`;
}

const globalForCRM = globalThis as unknown as {
  crmDb: CRMPrismaClient | undefined;
};

export const crmDb =
  globalForCRM.crmDb ??
  new CRMPrismaClient({
    datasources: {
      db: {
        url: getCrmDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForCRM.crmDb = crmDb;
}

export default crmDb;
