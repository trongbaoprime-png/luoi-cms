/**
 * Script: Dọn dẹp demo data cũ + fix homepage settings
 * - Xóa demo posts không liên quan
 * - Xóa demo categories không liên quan
 * - Set homepage_type = "static" trỏ về page "trang-chu"
 */
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function cleanup() {
  console.log("=== DỌN DEMO DATA + FIX HOMEPAGE ===");

  // 1. Xóa tất cả posts cũ (demo)
  const deletedPosts = await p.post.deleteMany({});
  console.log(`Đã xóa ${deletedPosts.count} bài viết demo`);

  // 2. Xóa tất cả categories cũ (demo)
  const deletedCats = await p.category.deleteMany({});
  console.log(`Đã xóa ${deletedCats.count} danh mục demo`);

  // 3. Tìm page "trang-chu" hoặc page đầu tiên
  const homePage = await p.page.findFirst({
    where: { OR: [{ slug: "trang-chu" }, { slug: "home" }] },
    orderBy: { createdAt: "asc" },
  });

  if (homePage) {
    // 4. Set homepage_type = static, trỏ về page đó
    await p.setting.upsert({
      where: { key: "homepage_type" },
      update: { value: "static" },
      create: { key: "homepage_type", value: "static" },
    });
    await p.setting.upsert({
      where: { key: "homepage_page_id" },
      update: { value: homePage.id },
      create: { key: "homepage_page_id", value: homePage.id },
    });
    console.log(`✅ Homepage → Page: "${homePage.title}" (id: ${homePage.id})`);
  } else {
    console.log("⚠️ Không tìm thấy page home/trang-chu trong DB");
  }

  // 5. Status sau cleanup
  const posts = await p.post.count();
  const cats = await p.category.count();
  const pages = await p.page.count();
  console.log(`\nSau cleanup: Posts=${posts} | Categories=${cats} | Pages=${pages}`);

  await p.$disconnect();
  console.log("=== DONE ===");
}

cleanup().catch(console.error);
