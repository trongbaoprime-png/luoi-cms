import { PrismaClient as TrackingPrismaClient } from "@prisma/client-tracking";

const globalForTracking = globalThis as unknown as {
  trackingDb: TrackingPrismaClient | undefined;
};

function createTrackingClient() {
  const envUrl =
    process.env.TRACKING_DATABASE_URL ||
    process.env.TRACKING_DB_URL ||
    "postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_tracking?schema=public";


  return new TrackingPrismaClient({
    datasources: { db: { url: envUrl } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const trackingDb = globalForTracking.trackingDb ?? createTrackingClient();

if (process.env.NODE_ENV !== "production") {
  globalForTracking.trackingDb = trackingDb;
}

export default trackingDb;
