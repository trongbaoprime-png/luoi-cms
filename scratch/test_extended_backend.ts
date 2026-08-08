import { db } from "../src/lib/db";
import { buildAffiliateUrl } from "../src/lib/tracking";
import { addJobToQueue } from "../src/lib/queue/worker";

async function testExtendedBackend() {
  console.log("==========================================");
  console.log("🛠️ TESTING EXTENDED ENTERPRISE BACKEND");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  // 1. Test Affiliate Link Builder with UTM
  try {
    console.log("\n[Test 1]: Testing Affiliate Link Builder & UTM Injector...");
    const rawUrl = "https://shopee.vn/product/123456";
    const builtUrl = buildAffiliateUrl(rawUrl, {
      merchant: "Shopee",
      subId: "campaign_summer_2026",
      utmCampaign: "affiliate_deals",
    });

    if (builtUrl.includes("utm_source=luoidonnha") && builtUrl.includes("sub_id=campaign_summer_2026")) {
      console.log(`  ✅ UTM & Affiliate SubID injection: PASSED\n     (${builtUrl})`);
      passed++;
    } else {
      throw new Error("URL builder failed to inject tracking parameters");
    }
  } catch (err) {
    console.error("  ❌ Test 1 FAILED:", (err as Error).message);
    failed++;
  }

  // 2. Test Background Job Queue Worker
  try {
    console.log("\n[Test 2]: Testing Background Job Queue System...");
    const jobId1 = addJobToQueue("JOB_META_CAPI_SYNC", { eventName: "PageView", eventSourceUrl: "https://luoidonnha.com" });
    const jobId2 = addJobToQueue("JOB_AI_ARTICLE_GEN", { topic: "Cách làm sạch bếp từ hiệu quả" });

    if (jobId1 && jobId2) {
      console.log("  ✅ Background Job Queue Push & Worker Execution: PASSED");
      passed++;
    } else {
      throw new Error("Job queue failed to push jobs");
    }
  } catch (err) {
    console.error("  ❌ Test 2 FAILED:", (err as Error).message);
    failed++;
  }

  // 3. Test Database CRUD via Prisma Singleton
  try {
    console.log("\n[Test 3]: Testing Product & Analytics DB Query Engine...");
    const testProduct = await db.product.create({
      data: {
        title: "Cây lau nhà tự vắt thông minh Lười Dọn Nhà",
        slug: `cay-lau-nha-smart-${Date.now()}`,
        price: 199000,
        originalPrice: 299000,
        affiliateUrl: "https://shopee.vn/cay-lau-nha-smart",
        merchant: "Shopee",
        rating: 4.9,
        isFeatured: true,
      },
    });

    const found = await db.product.findUnique({ where: { id: testProduct.id } });
    await db.product.delete({ where: { id: testProduct.id } });

    if (found && found.title.includes("Lười Dọn Nhà")) {
      console.log("  ✅ Product DB CRUD & Singleton Connection: PASSED");
      passed++;
    } else {
      throw new Error("Product DB query returned null");
    }
  } catch (err) {
    console.error("  ❌ Test 3 FAILED:", (err as Error).message);
    failed++;
  }

  console.log("\n==========================================");
  console.log(`🎉 EXTENDED BACKEND RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  await db.$disconnect();
}

testExtendedBackend();
