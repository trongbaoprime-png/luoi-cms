/**
 * LƯỜI CMS - Super Admin Management CLI Utility (SEC-001C)
 * Safely creates or resets the primary SUPER_ADMIN user without logging secrets.
 * Uses official Argon2id password hashing library.
 *
 * Usage:
 *   node scripts/manage-admin.js <username> <email> <password> [role]
 *
 * Example:
 *   node scripts/manage-admin.js admin admin@luoidonnha.com MySecurePass123! SUPER_ADMIN
 */

const argon2 = require("argon2");
const { PrismaClient } = require("../node_modules/@prisma/client-cms");

const prisma = new PrismaClient();

async function hashPassword(password) {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
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

  const hashedPassword = await hashPassword(password);

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
