import { PrismaClient as CRMPrismaClient } from "@prisma/client-crm";

const globalForCRM = globalThis as unknown as {
  crmDb: CRMPrismaClient | undefined;
};

export const crmDb =
  globalForCRM.crmDb ??
  new CRMPrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForCRM.crmDb = crmDb;
}

export default crmDb;
