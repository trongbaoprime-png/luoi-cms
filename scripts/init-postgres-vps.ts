import { Client } from "pg";

/**
 * Script tự động khởi tạo các Database luoi_crm và luoi_omni trên PostgreSQL nếu chưa có.
 */
async function initPostgres() {
  const crmUrl = process.env.CRM_DATABASE_URL || process.env.CRM_POSTGRES_URL;
  const omniUrl = process.env.OMNI_DATABASE_URL || process.env.OMNI_POSTGRES_URL;

  if (!crmUrl || !crmUrl.startsWith("postgresql://")) {
    console.log("ℹ️ CRM_DATABASE_URL không dùng PostgreSQL. Bỏ qua bước tạo DB.");
    return;
  }

  try {
    // 1. Kết nối tới default database 'postgres' để tạo DB 'luoi_crm' & 'luoi_omni' nếu chưa có
    const parseUrl = (urlStr: string) => {
      const match = urlStr.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
      if (!match) return null;
      return { user: match[1], password: match[2], host: match[3], port: Number(match[4]), dbName: match[5] };
    };

    const crmMeta = parseUrl(crmUrl);
    if (crmMeta) {
      const defaultDbUrl = `postgresql://${crmMeta.user}:${crmMeta.password}@${crmMeta.host}:${crmMeta.port}/postgres`;
      const client = new Client({ connectionString: defaultDbUrl });
      await client.connect();

      // Check & create luoi_crm
      const checkCrm = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [crmMeta.dbName]);
      if (checkCrm.rowCount === 0) {
        console.log(`🔨 Tạo mới Cơ sở dữ liệu PostgreSQL: ${crmMeta.dbName}...`);
        await client.query(`CREATE DATABASE "${crmMeta.dbName}";`);
        console.log(`✅ Đã tạo thành công DB ${crmMeta.dbName}!`);
      } else {
        console.log(`✅ Cơ sở dữ liệu PostgreSQL '${crmMeta.dbName}' đã tồn tại.`);
      }

      // Check & create luoi_omni
      if (omniUrl) {
        const omniMeta = parseUrl(omniUrl);
        if (omniMeta) {
          const checkOmni = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [omniMeta.dbName]);
          if (checkOmni.rowCount === 0) {
            console.log(`🔨 Tạo mới Cơ sở dữ liệu PostgreSQL: ${omniMeta.dbName}...`);
            await client.query(`CREATE DATABASE "${omniMeta.dbName}";`);
            console.log(`✅ Đã tạo thành công DB ${omniMeta.dbName}!`);
          } else {
            console.log(`✅ Cơ sở dữ liệu PostgreSQL '${omniMeta.dbName}' đã tồn tại.`);
          }
        }
      }

      await client.end();
    }
  } catch (error: any) {
    console.log("ℹ️ Lỗi tạo DB tự động (có thể DB đã tồn tại hoặc đã được cấp sẵn quyền):", error.message || error);
  }
}

initPostgres();
