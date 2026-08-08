const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({ include: { category: true } });
  posts.forEach(p => {
    console.log(`ID: ${p.id} | Slug: ${p.slug}`);
    console.log(`Title: ${p.title}`);
    console.log(`Category: ${p.category?.name} (${p.category?.slug})`);
    console.log(`Content Snippet: ${p.content ? p.content.slice(0, 150) : "EMPTY"}`);
    console.log("-----------------------------------------");
  });
}

main().finally(() => prisma.$disconnect());
