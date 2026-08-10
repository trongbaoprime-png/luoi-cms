import path from "path";
import { PrismaClient as OmniPrismaClient } from "@prisma/client-omni";

const globalForOmni = globalThis as unknown as {
  omniDb: OmniPrismaClient | undefined;
};

function getOmniDatabaseUrl() {
  const envUrl = process.env.OMNI_DATABASE_URL;
  if (envUrl && envUrl.startsWith("file:")) {
    return envUrl;
  }
  const absoluteDbPath = path.resolve(process.cwd(), "prisma", "omnichannel.db");
  return `file:${absoluteDbPath}`;
}

export const omniDb =
  globalForOmni.omniDb ??
  new OmniPrismaClient({
    datasources: {
      db: {
        url: getOmniDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

export const omnichannelDb = omniDb;

if (process.env.NODE_ENV !== "production") {
  globalForOmni.omniDb = omniDb;
}

export default omniDb;
