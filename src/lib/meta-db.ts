import { PrismaClient as MetaPrismaClient } from "@prisma/client-meta";

const globalForMeta = globalThis as unknown as {
  metaDb: MetaPrismaClient | undefined;
};

function createMetaClient() {
  const envUrl =
    process.env.META_ADS_DATABASE_URL ||
    process.env.META_DATABASE_URL ||
    "postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_meta?schema=public";


  return new MetaPrismaClient({
    datasources: { db: { url: envUrl } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const metaDb = globalForMeta.metaDb ?? createMetaClient();

if (process.env.NODE_ENV !== "production") {
  globalForMeta.metaDb = metaDb;
}

export default metaDb;
