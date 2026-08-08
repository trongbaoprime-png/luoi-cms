import { cmsDb } from "@/lib/cms-db";
import DynamicStaticPage from "@/app/[slug]/page";
import Header from "@/components/Header";
import LuoiHeroSection from "@/components/LuoiHeroSection";
import VoucherToolWidget from "@/components/VoucherToolWidget";
import ReelsVideoSection from "@/components/ReelsVideoSection";
import WorkflowSteps from "@/components/WorkflowSteps";
import TrustBadges from "@/components/TrustBadges";
import LuoiFooter from "@/components/LuoiFooter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootHomePage() {
  try {
    const [homepageTypeSetting, homepagePageIdSetting] = await Promise.all([
      cmsDb.setting.findUnique({ where: { key: "homepage_type" } }).catch(() => null),
      cmsDb.setting.findUnique({ where: { key: "homepage_page_id" } }).catch(() => null),
    ]);

    const homepageType = homepageTypeSetting?.value || "blog";
    const homepagePageId = homepagePageIdSetting?.value;

    // 1. Khi người dùng chọn "Một trang tĩnh":
    if (homepageType === "static") {
      let selectedPage = null;

      // Tìm theo ID trang đã chọn
      if (homepagePageId) {
        selectedPage = await cmsDb.page.findFirst({
          where: {
            OR: [
              { id: homepagePageId },
              { slug: homepagePageId },
            ],
          },
        }).catch(() => null);
      }

      // Nếu không thấy theo ID, tìm trang tĩnh slug="home"
      if (!selectedPage) {
        selectedPage = await cmsDb.page.findFirst({
          where: { slug: "home" },
        }).catch(() => null);
      }

      // Nếu tìm thấy trang tĩnh được xuất bản, nạp giao diện Builder
      if (selectedPage && selectedPage.isPublished) {
        return (
          <DynamicStaticPage
            params={Promise.resolve({ slug: selectedPage.slug })}
          />
        );
      }
    }
  } catch {
    // Fallback gracefully
  }

  // 2. Khi người dùng chọn "Bài viết mới nhất (Giao diện Mặc định đầy đủ Hero Banner & Deals)":
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ed] text-[#1a1612] font-sans antialiased selection:bg-[#0d4f4a]/15 selection:text-[#0d4f4a]">
      <Header />
      <main className="flex-1">
        <LuoiHeroSection />

        <div id="tool-widget" className="scroll-mt-14">
          <VoucherToolWidget />
        </div>

        <ReelsVideoSection />

        <WorkflowSteps />
        <TrustBadges />
      </main>
      <LuoiFooter />
    </div>
  );
}
