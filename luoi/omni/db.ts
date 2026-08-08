import { PrismaClient as OmniPrismaClient } from "@prisma/client-omni";
import path from "path";

function getOmniDatabaseUrl() {
  if (process.env.OMNI_DATABASE_URL) {
    return process.env.OMNI_DATABASE_URL;
  }
  const dbPath = path.resolve(process.cwd(), "luoi", "omni", "omni.db");
  return `file:${dbPath}`;
}

const globalForOmni = globalThis as unknown as {
  omniDb: OmniPrismaClient | undefined;
};

export const omniDb =
  globalForOmni.omniDb ??
  new OmniPrismaClient({
    datasources: {
      db: {
        url: getOmniDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

export const omnichannelDb = omniDb;

if (process.env.NODE_ENV !== "production") {
  globalForOmni.omniDb = omniDb;
}

export default omniDb;
