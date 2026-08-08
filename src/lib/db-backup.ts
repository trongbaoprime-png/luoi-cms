import fs from "fs";
import path from "path";

/**
 * Creates a safety timestamped backup snapshot of the SQLite database file before major updates/syncs.
 */
export function backupDatabaseSnapshot(): { success: boolean; backupPath?: string; error?: string } {
  try {
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");
    if (!fs.existsSync(dbPath)) {
      return { success: false, error: "Database file dev.db not found" };
    }

    const backupsDir = path.join(process.cwd(), "prisma", "backups");
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `dev.db.backup.${timestamp}.db`;
    const backupPath = path.join(backupsDir, backupFileName);

    fs.copyFileSync(dbPath, backupPath);

    // Keep only the latest 10 backup snapshots to manage disk space
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith("dev.db.backup."))
      .sort((a, b) => b.localeCompare(a));

    if (files.length > 10) {
      files.slice(10).forEach(oldFile => {
        try {
          fs.unlinkSync(path.join(backupsDir, oldFile));
        } catch {}
      });
    }

    return { success: true, backupPath };
  } catch (err: any) {
    console.error("Database backup snapshot failed:", err);
    return { success: false, error: err.message || "Failed to create backup" };
  }
}
