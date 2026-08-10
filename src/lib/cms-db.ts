import path from "path";
import fs from "fs";
import { PrismaClient as CMSPrismaClient } from "@prisma/client-cms";

const globalForCMS = globalThis as unknown as {
  cmsDb: CMSPrismaClient | undefined;
};

function getCmsDatabaseUrl() {
  const possiblePaths = [
    path.resolve(process.cwd(), "prisma", "luoi-cms.db"),
    path.resolve(__dirname, "../../prisma", "luoi-cms.db"),
    "/var/www/app/path-app/prisma/luoi-cms.db",
  ];

  let targetPath = possiblePaths[0];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  // Tự tạo thư mục nếu chưa tồn tại
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  }

  return `file:${targetPath}`;
}

export const cmsDb =
  globalForCMS.cmsDb ??
  new CMSPrismaClient({
    datasources: {
      db: {
        url: getCmsDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForCMS.cmsDb = cmsDb;
}

export default cmsDb;
