const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up old unrelated test data from database...");

  // 1. Delete old test posts related to dental (DSG, Invisalign, Trụ Biotem)
  const deletedPosts = await prisma.post.deleteMany({
    where: {
      OR: [
        { slug: { contains: "dsg" } },
        { title: { contains: "DSG" } },
        { title: { contains: "BIOTEM" } },
        { content: { contains: "Invisalign" } },
        { content: { contains: "Tâm Đức Smile" } },
      ],
    },
  });
  console.log(`Deleted ${deletedPosts.count} old unrelated dental posts.`);

  // 2. Check if category "Đi chợ" exists or create clean categories
  let diChoCat = await prisma.category.findFirst({ where: { slug: "i-cho" } });
  if (!diChoCat) {
    diChoCat = await prisma.category.findFirst({ where: { name: { contains: "Đi chợ" } } });
  }

  if (!diChoCat) {
    diChoCat = await prisma.category.create({
      data: {
        name: "Đi chợ & Thực phẩm",
        slug: "di-cho",
        description: "Mẹo đi chợ thông minh, chọn thực phẩm tươi ngon và bảo quản thực phẩm lâu hỏng.",
      },
    });
  } else {
    // Update slug to clean top-level slug if needed
    diChoCat = await prisma.category.update({
      where: { id: diChoCat.id },
      data: {
        name: "Đi Chợ & Mua Sắm",
        slug: "di-cho",
        description: "Mẹo chọn mua thực phẩm tươi ngon, tiết kiệm chi phí cho gia đình.",
      },
    });
  }

  // 3. Create a clean, high-quality relevant article for "Đi Chợ & Mua Sắm"
  const existingPost = await prisma.post.findFirst({
    where: { slug: "meo-di-cho-tiet-kiem-va-bao-quan-thuc-pham-tuoi-ngon" },
  });

  if (!existingPost) {
    await prisma.post.create({
      data: {
        title: "10 Mẹo Đi Chợ Tiết Kiệm & Bảo Quản Thực Phẩm Tươi Ngon Cả Tuần",
        slug: "meo-di-cho-tiet-kiem-va-bao-quan-thuc-pham-tuoi-ngon",
        categoryId: diChoCat.id,
        summary: "Bí quyết lên danh sách thực phẩm, chọn rau củ quả tươi ngon và phương pháp bảo quản trong tủ lạnh giúp gia đình tiết kiệm tối đa thời gian và chi phí.",
        content: `
          <h2>1. Lên danh sách thực phẩm cần mua trước khi đi chợ</h2>
          <p>Việc lên sẵn danh sách giúp bạn tránh mua phải những món đồ dư thừa, tiết kiệm chi phí và thời gian di chuyển giữa các gian hàng.</p>
          
          <h2>2. Cách chọn rau củ tươi ngon không chứa hóa chất</h2>
          <p>Nên chọn rau củ đúng mùa vụ, màu sắc tự nhiên, củ cầm chắc tay. Tránh những loại rau lá xanh đậm khác thường hoặc củ quả có kích thước quá lứa.</p>
          
          <h2>3. Phương pháp phân loại và bảo quản trong tủ lạnh</h2>
          <p>Rau xanh nên được lau khô trước khi bọc giấy báo hoặc hộp kín. Thịt cá tươi sống nên chia nhỏ thành từng khẩu phần ăn theo ngày trước khi bỏ ngăn đông.</p>
          
          <h2>4. Mẹo tận dụng thực phẩm tối ưu cho người lười</h2>
          <p>Sử dụng các hộp đựng thực phẩm chia ngăn thông minh giúp bạn dễ dàng chuẩn bị nguyên liệu nấu ăn chỉ trong 10-15 phút mỗi bữa.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
        status: "PUBLISHED",
        readTimeMinutes: 5,
        seoTitle: "10 Mẹo Đi Chợ Tiết Kiệm & Bảo Quản Thực Phẩm Tươi Ngon - Lười Dọn Nhà",
        seoDescription: "Bí quyết lên danh sách thực phẩm, chọn rau củ tươi ngon và cách bảo quản tủ lạnh tiết kiệm thời gian cho gia đình bận rộn.",
      },
    });
    console.log("Created clean sample article: meo-di-cho-tiet-kiem-va-bao-quan-thuc-pham-tuoi-ngon");
  }

  console.log("=== DATABASE CLEANUP COMPLETED ===");
}

main().finally(() => prisma.$disconnect());
