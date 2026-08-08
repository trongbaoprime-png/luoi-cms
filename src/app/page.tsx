import { cmsDb } from "@/lib/cms-db";
import DynamicStaticPage from "@/app/[slug]/page";
import Header from "@/components/Header";
import LuoiHeroSection from "@/components/LuoiHeroSection";
import VoucherToolWidget from "@/components/VoucherToolWidget";
import ReelsVideoSection from "@/components/ReelsVideoSection";
import WorkflowSteps from "@/components/WorkflowSteps";
import TrustBadges from "@/components/TrustBadges";
import LuoiFooter from "@/components/LuoiFooter";

export default async function RootHomePage() {
  try {
    const [homepageTypeSetting, homepagePageIdSetting] = await Promise.all([
      cmsDb.setting.findUnique({ where: { key: "homepage_type" } }).catch(() => null),
      cmsDb.setting.findUnique({ where: { key: "homepage_page_id" } }).catch(() => null),
    ]);

    const homepageType = homepageTypeSetting?.value || "blog";
    const homepagePageId = homepagePageIdSetting?.value;

    if (homepageType === "static" && homepagePageId) {
      const selectedPage = await cmsDb.page.findUnique({
        where: { id: homepagePageId },
      }).catch(() => null);

      if (selectedPage && selectedPage.isPublished) {
        return (
          <DynamicStaticPage
            params={Promise.resolve({ slug: selectedPage.slug })}
          />
        );
      }
    }

    // Fallback to default /home page if configured
    const homePage = await cmsDb.page.findUnique({
      where: { slug: "home" },
    }).catch(() => null);

    if (homePage && homePage.isPublished) {
      return <DynamicStaticPage params={Promise.resolve({ slug: "home" })} />;
    }
  } catch {
    // Fallback gracefully during static prerendering or fresh database init
  }

  // Default fallback — dùng Header dynamic (cùng font-mono style với toàn bộ site)
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
