const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runTests() {
  console.log("==========================================");
  console.log("🧪 TESTING LƯỜI DỌN NHÀ - FRONTEND & BACKEND");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  // 1. Database Connection & Schema Test
  try {
    console.log("\n[Backend Test 1]: Checking Prisma DB Models...");
    const postCount = await prisma.post.count();
    const productCount = await prisma.product.count();
    const dealCount = await prisma.deal.count();
    const subscriberCount = await prisma.subscriber.count();
    const contactCount = await prisma.contactMessage.count();
    const clickCount = await prisma.clickLog.count();

    console.log(`  - Posts: ${postCount}`);
    console.log(`  - Products: ${productCount}`);
    console.log(`  - Deals: ${dealCount}`);
    console.log(`  - Subscribers: ${subscriberCount}`);
    console.log(`  - Contacts: ${contactCount}`);
    console.log(`  - Click Logs: ${clickCount}`);
    console.log("  ✅ DB Model Test: PASSED");
    passed++;
  } catch (err) {
    console.error("  ❌ DB Model Test FAILED:", err.message);
    failed++;
  }

  // 2. Test Zod Validation & Rate Limiting Logic
  try {
    console.log("\n[Backend Test 2]: Testing Zod Schema Validation...");
    const { ContactFormSchema, NewsletterSchema } = require("../src/lib/validation");
    
    // Valid input
    ContactFormSchema.parse({
      name: "Nguyễn Văn A",
      email: "test@example.com",
      message: "Tôi muốn hợp tác quảng cáo",
    });

    NewsletterSchema.parse({
      email: "subscriber@example.com",
    });

    console.log("  ✅ Zod Input Validation: PASSED");
    passed++;
  } catch (err) {
    console.error("  ❌ Zod Validation FAILED:", err.message);
    failed++;
  }

  // 3. Test Security & HMAC Verification
  try {
    console.log("\n[Backend Test 3]: Testing Security & HMAC Verification...");
    const { verifyHmacSignature, sanitizeString } = require("../src/lib/security");
    const crypto = require("crypto");

    const secret = "test-secret-key";
    const payload = JSON.stringify({ event: "purchase", amount: 150000 });
    const validSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const isValid = verifyHmacSignature(payload, validSignature, secret);
    const isInvalid = verifyHmacSignature(payload, "wrong-signature", secret);

    if (isValid && !isInvalid) {
      console.log("  ✅ HMAC Signature Verification: PASSED");
      passed++;
    } else {
      throw new Error("HMAC logic returned incorrect verification result");
    }
  } catch (err) {
    console.error("  ❌ HMAC Security Test FAILED:", err.message);
    failed++;
  }

  // 4. Test SEO Schema Generators
  try {
    console.log("\n[Frontend Test 4]: Testing SEO Schema.org Generators...");
    const { generateArticleSchema, generateProductSchema } = require("../src/lib/seo");
    
    const articleSchema = generateArticleSchema({
      title: "10 Mẹo Dọn Nhà Siêu Nhanh",
      url: "https://luoidonnha.com/blog/10-meo-don-nha",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (articleSchema["@type"] === "Article" && articleSchema.headline === "10 Mẹo Dọn Nhà Siêu Nhanh") {
      console.log("  ✅ SEO Schema JSON-LD Generator: PASSED");
      passed++;
    } else {
      throw new Error("Article Schema returned invalid structure");
    }
  } catch (err) {
    console.error("  ❌ SEO Schema Test FAILED:", err.message);
    failed++;
  }

  console.log("\n==========================================");
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  await prisma.$disconnect();
}

runTests();
