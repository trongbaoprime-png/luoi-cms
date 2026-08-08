import fs from "fs";
import path from "path";

async function seedIsolatedDbs() {
  const prismaDir = path.resolve(__dirname, "prisma");
  const devDb = path.join(prismaDir, "dev.db");
  const cmsDbPath = path.join(prismaDir, "luoi-cms.db");
  const crmDbPath = path.join(prismaDir, "minicrm.db");
  const omniDbPath = path.join(prismaDir, "omnichannel.db");

  console.log("Seeding isolated SQLite databases from 24.1MB Master DB...");

  if (fs.existsSync(devDb)) {
    const size = fs.statSync(devDb).size;
    console.log(`Source Master DB size: ${size} bytes`);
    
    // Copy dev.db to luoi-cms.db & minicrm.db
    fs.copyFileSync(devDb, cmsDbPath);
    console.log(`✅ Copied dev.db -> ${cmsDbPath} (${fs.statSync(cmsDbPath).size} bytes)`);

    fs.copyFileSync(devDb, crmDbPath);
    console.log(`✅ Copied dev.db -> ${crmDbPath} (${fs.statSync(crmDbPath).size} bytes)`);
  } else {
    console.error("❌ dev.db not found!");
  }

  process.exit(0);
}

seedIsolatedDbs();
