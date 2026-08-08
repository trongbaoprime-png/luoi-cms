/**
 * Script: Reset tất cả Settings về mặc định
 * Chạy: npx tsx scripts/reset-settings.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: "Lười Dọn Nhà",
  slogan: "Nhà vẫn gọn, dù bạn rất lười",
  homepage_type: "blog",
  homepage_page_id: "",
  meta_pixel_id: "",
  logo_url: "",
  logo_pos_desktop: "left",
  logo_pos_mobile: "left",
  menu_pos_desktop: "right",
  logo_height_desktop: "40",
  logo_height_mobile: "32",
  menu_font: "default",
  menu_color_text: "#44403c",
  menu_color_hover: "#0d4f4a",
  menu_color_active: "#0d4f4a",
  discourage_search_engines: "false",
  cdn_url: "",
  indexnow_api_key: "",
  header_cta_buttons: JSON.stringify([
    {
      id: "cta-1",
      enabled: true,
      text: "Xem sản phẩm →",
      actionType: "URL",
      url: "/products",
      bgColor: "#0d4f4a",
      textColor: "#ffffff",
    },
  ]),
};

async function resetSettings() {
  console.log("=== RESET SETTINGS VỀ MẶC ĐỊNH ===");

  // Xóa toàn bộ settings cũ
  const deleted = await prisma.setting.deleteMany({});
  console.log(`Đã xóa ${deleted.count} settings cũ`);

  // Tạo lại với defaults
  const creates = Object.entries(DEFAULT_SETTINGS).map(([key, value]) =>
    prisma.setting.create({ data: { key, value } })
  );
  await Promise.all(creates);
  console.log(`Đã tạo lại ${creates.length} settings mặc định`);

  const total = await prisma.setting.count();
  console.log(`Tổng setting trong DB: ${total}`);

  await prisma.$disconnect();
  console.log("=== DONE ===");
}

resetSettings().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
