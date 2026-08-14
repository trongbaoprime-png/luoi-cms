const { db } = require("./src/lib/db");

async function test() {
  try {
    console.log("Testing Category findMany...");
    const cats = await db.category.findMany({ take: 1 });
    console.log("Category OK:", cats);
  } catch (err) {
    console.error("Category Error:", err.message);
  }

  try {
    console.log("Testing Page findMany...");
    const pages = await db.page.findMany({ take: 1 });
    console.log("Page OK:", pages);
  } catch (err) {
    console.error("Page Error:", err.message);
  }

  process.exit(0);
}

test();
