import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const posts = await p.post.count();
  const cats = await p.category.count();
  const pages = await p.page.count();
  const settings = await p.setting.findMany({
    where: { key: { in: ["homepage_type", "homepage_page_id"] } },
  });
  const catList = await p.category.findMany({ select: { id: true, name: true, slug: true } });
  const postList = await p.post.findMany({ select: { id: true, title: true, slug: true, status: true } });
  const pageList = await p.page.findMany({ select: { id: true, title: true, slug: true, isPublished: true } });
  console.log("=== DB STATUS ===");
  console.log("Posts:", posts, "| Categories:", cats, "| Pages:", pages);
  console.log("Settings:", JSON.stringify(settings));
  console.log("Categories:", JSON.stringify(catList, null, 2));
  console.log("Posts:", JSON.stringify(postList, null, 2));
  console.log("Pages:", JSON.stringify(pageList, null, 2));
  await p.$disconnect();
}
main().catch(console.error);
