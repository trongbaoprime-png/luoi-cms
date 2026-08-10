import { PrismaClient as OmniPrismaClient } from "@prisma/client-omni";

const globalForOmni = globalThis as unknown as {
  omniDb: OmniPrismaClient | undefined;
};

const omniUrl =
  process.env.OMNI_DATABASE_URL ||
  process.env.OMNI_POSTGRES_URL ||
  "postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_omni?schema=public";

export const omniDb =
  globalForOmni.omniDb ??
  new OmniPrismaClient({
    datasources: {
      db: {
        url: omniUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

export const omnichannelDb = omniDb;

if (process.env.NODE_ENV !== "production") {
  globalForOmni.omniDb = omniDb;
}

export default omniDb;
