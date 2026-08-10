import path from "path";
import { PrismaClient as OmniPrismaClientSQLite } from "@prisma/client-omni";
import { PrismaClient as OmniPrismaClientPG } from "@prisma/client-omni-pg";

const globalForOmni = globalThis as unknown as {
  omniDb: OmniPrismaClientSQLite | undefined;
};

function createOmniClient() {
  const envUrl = process.env.OMNI_DATABASE_URL || process.env.OMNI_POSTGRES_URL;

  if (envUrl && envUrl.startsWith("postgresql://")) {
    return new OmniPrismaClientPG({
      datasources: {
        db: {
          url: envUrl,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    }) as unknown as OmniPrismaClientSQLite;
  }

  const absoluteDbPath = path.resolve(process.cwd(), "prisma", "omnichannel.db");
  const sqliteUrl = envUrl && envUrl.startsWith("file:") ? envUrl : `file:${absoluteDbPath}`;

  return new OmniPrismaClientSQLite({
    datasources: {
      db: {
        url: sqliteUrl,
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
