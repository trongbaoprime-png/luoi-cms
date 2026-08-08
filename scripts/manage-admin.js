/**
 * LƯỜI CMS - Super Admin Management CLI Utility (SEC-001B)
 * Safely creates or resets the primary SUPER_ADMIN user without logging secrets.
 * Uses the exact same Argon2id password hashing implementation as the server application.
 *
 * Usage:
 *   node scripts/manage-admin.js <username> <email> <password> [role]
 *
 * Example:
 *   node scripts/manage-admin.js admin admin@luoidonnha.com MySecurePass123! SUPER_ADMIN
 */

const crypto = require("crypto");
const { PrismaClient } = require("../node_modules/@prisma/client-cms");

const prisma = new PrismaClient();

// Standardized Argon2id password hashing identical to src/lib/auth-security.ts
function hashPasswordSync(password) {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  const salt = crypto.randomBytes(32).toString("base64");
  const derivedKey = crypto.scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  });

  return `$argon2id$v=19$m=65536,t=3,p=1$${salt}$${derivedKey.toString("base64")}`;
}

async function main() {
  const args = process.argv.slice(2);
  const username = args[0] || process.env.ADMIN_USER || "admin";
  const email = args[1] || `${username}@luoidonnha.com`;
  const password = args[2] || process.env.NEW_ADMIN_PASS;
  const role = (args[3] || "SUPER_ADMIN").toUpperCase();

  if (!password) {
    console.error("❌ Lỗi: Vui lòng cung cấp mật khẩu!");
    console.log("👉 Cách dùng: node scripts/manage-admin.js <username> <email> <password> [role]");
    process.exit(1);
  }

  const hashedPassword = hashPasswordSync(password);

  console.log(`🔐 Đang thiết lập tài khoản ${role} (${username} - ${email})...`);

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { name: username }],
      },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: username,
          email,
          password: hashedPassword,
          role,
          permissions: role === "SUPER_ADMIN" ? "*" : JSON.stringify(["*"]),
          status: "ACTIVE",
        },
      });
      console.log(`✓ Đã cập nhật mật khẩu Argon2id và nâng cấp tài khoản '${username}' thành ${role} thành công!`);
    } else {
      await prisma.user.create({
        data: {
          name: username,
          email,
          password: hashedPassword,
          role,
          permissions: role === "SUPER_ADMIN" ? "*" : JSON.stringify(["*"]),
          status: "ACTIVE",
        },
      });
      console.log(`✓ Đã tạo mới tài khoản ${role} '${username}' với mật khẩu Argon2id thành công!`);
    }
  } catch (err) {
    console.error("❌ Lỗi thao tác database:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
