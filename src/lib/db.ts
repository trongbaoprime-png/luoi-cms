import { PrismaClient as DefaultPrismaClient } from "@prisma/client";
import cmsDb from "./cms-db";
import crmDb from "./crm-db";
import omniDb, { omnichannelDb } from "./omni-db";

const globalForPrisma = globalThis as unknown as {
  prisma: DefaultPrismaClient | undefined;
};

// Unified CMS Database export for all content, articles, pages, categories, settings
export const db = cmsDb;

export { cmsDb, crmDb, omniDb, omnichannelDb };

