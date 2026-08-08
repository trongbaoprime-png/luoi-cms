import { PrismaClient } from "@prisma/client";
import { ContactFormSchema, NewsletterSchema } from "../src/lib/validation";
import { verifyHmacSignature } from "../src/lib/security";
import { generateArticleSchema, generateProductSchema } from "../src/lib/seo";
import crypto from "crypto";

const prisma = new PrismaClient();

async function runTests() {
  console.log("==========================================");
  console.log("🧪 RUNNING COMPREHENSIVE SUITE - LƯỜI DỌN NHÀ");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  // 1. Database Model & Connection Test
  try {
    console.log("\n[Test 1]: Checking Prisma DB Models...");
    const postCount = await prisma.post.count();
    const productCount = await prisma.product.count();
    const dealCount = await prisma.deal.count();
    const subscriberCount = await prisma.subscriber.count();
    const contactCount = await prisma.contactMessage.count();
    const clickCount = await prisma.clickLog.count();

    console.log(`  - Posts: ${postCount}, Products: ${productCount}, Deals: ${dealCount}`);
    console.log(`  - Subscribers: ${subscriberCount}, Contacts: ${contactCount}, Clicks: ${clickCount}`);
    console.log("  ✅ DB Models & Connectivity: PASSED");
    passed++;
  } catch (err) {
    console.error("  ❌ DB Model Test FAILED:", (err as Error).message);
    failed++;
  }

  // 2. Zod Validation Engine Test
  try {
    console.log("\n[Test 2]: Testing Zod Schema Validation Engine...");
    ContactFormSchema.parse({
      name: "Nguyễn Văn A",
      email: "test@example.com",
      message: "Tôi muốn hợp tác quảng cáo đồ gia dụng",
    });

    NewsletterSchema.parse({
      email: "subscriber@luoidonnha.com",
    });

    console.log("  ✅ Zod Input Validation: PASSED");
    passed++;
  } catch (err) {
    console.error("  ❌ Zod Validation FAILED:", (err as Error).message);
    failed++;
  }

  // 3. HMAC Security & Webhook Signatures Test
  try {
    console.log("\n[Test 3]: Testing Security & HMAC Signatures...");
    const secret = "secret-webhook-key-123";
    const payload = JSON.stringify({ event: "purchase", amount: 150000 });
    const validSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const isValid = verifyHmacSignature(payload, validSignature, secret);
    const isInvalid = verifyHmacSignature(payload, "invalid_sig", secret);

    if (isValid && !isInvalid) {
      console.log("  ✅ HMAC Signature Verification: PASSED");
      passed++;
    } else {
      throw new Error("HMAC logic returned incorrect verification result");
    }
  } catch (err) {
    console.error("  ❌ HMAC Security Test FAILED:", (err as Error).message);
    failed++;
  }

  // 4. SEO Schema JSON-LD Generator Test
  try {
    console.log("\n[Test 4]: Testing SEO Schema JSON-LD Generators...");
    const articleSchema = generateArticleSchema({
      title: "10 Mẹo Dọn Nhà Siêu Nhanh Tối Ưu Cho Người Lười",
      url: "https://luoidonnha.com/blog/10-meo-don-nha",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const productSchema = generateProductSchema({
      name: "Cây lau nhà tự vắt thông minh 360",
      price: 199000,
      rating: 4.9,
      url: "https://luoidonnha.com/api/affiliate/click?url=https://shopee.vn",
    });

    if (articleSchema["@type"] === "Article" && productSchema["@type"] === "Product") {
      console.log("  ✅ SEO Schema JSON-LD Generator: PASSED");
      passed++;
    } else {
      throw new Error("Schema returned invalid types");
    }
  } catch (err) {
    console.error("  ❌ SEO Schema Test FAILED:", (err as Error).message);
    failed++;
  }

  console.log("\n==========================================");
  console.log(`🎉 COMPREHENSIVE SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  await prisma.$disconnect();
}

runTests();
