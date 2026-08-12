import { PrismaClient as OmniPrismaClientPG } from "@prisma/client-omni-pg";

const globalForOmni = globalThis as unknown as {
  omniDb: OmniPrismaClientPG | undefined;
};

function createOmniClient() {
  const envUrl =
    process.env.OMNI_DATABASE_URL ||
    process.env.OMNI_POSTGRES_URL ||
    "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_omni?schema=public";

  return new OmniPrismaClientPG({
    datasources: {
      db: {
        url: envUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const omniDb = globalForOmni.omniDb ?? createOmniClient();
export const omnichannelDb = omniDb;

if (process.env.NODE_ENV !== "production") {
  globalForOmni.omniDb = omniDb;
}

export default omniDb;
