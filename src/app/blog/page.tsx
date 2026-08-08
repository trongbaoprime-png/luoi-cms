import { db } from "@/lib/db";
import Header from "@/components/Header";
import LuoiFooter from "@/components/LuoiFooter";
import Link from "next/link";
import { Metadata } from "next";
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Tag,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Blog Mẹo Nhà Gọn | Lười Dọn Nhà",
  description:
    "Tổng hợp mẹo hay, sản phẩm tiện ích, giải pháp giúp nhà cửa luôn gọn gàng mà không tốn công. Đọc ngay tại Lười Dọn Nhà!",
  alternates: { canonical: "https://luoidonnha.com/blog" },
};

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category: categorySlug, page: pageStr } = await searchParams;
  const currentPage = parseInt(pageStr || "1");
  const pageSize = 9;

  // Fetch all categories for filter bar
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  // Filter by category if provided
  let categoryFilter: any = undefined;
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) categoryFilter = cat.id;
  }

  const whereClause: any = { status: "PUBLISHED" };
  if (categoryFilter) whereClause.categoryId = categoryFilter;

  const [posts, totalCount] = await Promise.all([
    db.post.findMany({
      where: whereClause,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: { category: true },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    }),
    db.post.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#1a1612] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Technical Journal Hero Banner */}
        <section className="bg-[#f7f4ed] border-b border-[#1a1612] pt-12 pb-10 px-4">
          <div className="max-w-[1240px] mx-auto">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0d4f4a] uppercase tracking-widest mb-3">
              <BookOpen size={15} />
              <span>TECHNICAL JOURNAL & KINH NGHIỆM THỰC TẾ</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-medium font-serif text-[#1a1612] mb-4 leading-tight tracking-tight">
              Mẹo Nhà Gọn – Giải Pháp Đo Lường & ROI
            </h1>
            <p className="text-[#5c564f] font-serif text-base max-w-3xl leading-relaxed">
              Chia sẻ kinh nghiệm thực tế về mẹo dọn nhà nhanh, sản phẩm tiện ích thông minh, và các bài viết phân tích chuyên sâu về hệ thống đo lường LƯỜI CMS.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-6 text-xs font-mono text-[#5c564f]">
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#0d4f4a]" />
                {totalCount} bài viết
              </span>
              <span className="flex items-center gap-1.5">
                <Tag size={14} className="text-[#0d4f4a]" />
                {categories.length} danh mục
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#0d4f4a]" />
                Cập nhật real-time
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-[1240px] mx-auto px-4 pb-16">
          {/* Category Filter Bar */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap py-5 border-b border-[#d8d2c2] mb-8 font-mono text-xs">
              <Link
                href="/blog"
                className={`px-4 py-1.5 rounded-xs transition-all ${
                  !categorySlug
                    ? "bg-[#0d4f4a] text-white font-bold"
                    : "bg-white border border-[#1a1612] text-[#1a1612] hover:bg-[#eae5d9]"
                }`}
              >
                Tất cả ({totalCount})
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`px-4 py-1.5 rounded-xs transition-all ${
                    categorySlug === cat.slug
                      ? "bg-[#0d4f4a] text-white font-bold"
                      : "bg-white border border-[#1a1612] text-[#1a1612] hover:bg-[#eae5d9]"
                  }`}
                >
                  {cat.name} ({cat._count.posts})
                </Link>
              ))}
            </div>
          )}

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-20 space-y-4 font-serif">
              <div className="w-16 h-16 bg-[#0d4f4a]/10 text-[#0d4f4a] rounded-full flex items-center justify-center mx-auto">
                <BookOpen size={30} />
              </div>
              <h2 className="text-xl font-bold text-[#1a1612]">
                Chưa có bài viết nào
              </h2>
              <p className="text-[#5c564f] text-sm">
                Hãy quay lại sau, chúng mình đang biên tập bài viết!
              </p>
              <Link
                href="/"
                className="inline-block mt-2 px-6 py-2.5 bg-[#0d4f4a] text-white font-bold text-xs font-mono rounded-xl hover:bg-[#083b37] transition-colors shadow-xs"
              >
                Về Trang Chủ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
              {posts.map((post, idx) => (
                <article
                  key={post.id}
                  className={`bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col ${
                    idx === 0 && currentPage === 1 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  {/* Thumbnail */}
                  {post.coverImage ? (
                    <div className="h-48 overflow-hidden bg-stone-100">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-[#0d4f4a]/10 to-[#042d2a]/10 flex items-center justify-center">
                      <BookOpen size={40} className="text-[#0d4f4a]/40" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1 space-y-3">
                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-stone-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {post.readTimeMinutes || 5} phút
                      </span>
                    </div>

                    {/* Category badge */}
                    {post.category && (
                      <Link
                        href={`/${post.category.slug}`}
                        className="inline-block w-fit px-2.5 py-0.5 bg-[#0d4f4a]/10 text-[#0d4f4a] text-[10px] font-bold rounded-lg border border-[#0d4f4a]/30 hover:bg-[#0d4f4a]/20 transition-colors uppercase font-mono"
                      >
                        {post.category.name}
                      </Link>
                    )}

                    {/* Title */}
                    <h2 className="font-bold font-serif text-stone-900 leading-snug group-hover:text-[#0d4f4a] transition-colors line-clamp-2 text-[15px]">
                      <Link href={`/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {/* Summary */}
                    {post.summary && (
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 flex-1 font-sans">
                        {post.summary}
                      </p>
                    )}

                    {/* CTA */}
                    <div className="pt-3 border-t border-stone-100 mt-auto font-mono">
                      <Link
                        href={`/${post.slug}`}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#0d4f4a] hover:gap-2.5 transition-all"
                      >
                        Đọc bài viết <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 font-mono">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
                  className="px-4 py-2 text-xs font-bold border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  ← Trước
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/blog?page=${p}${categorySlug ? `&category=${categorySlug}` : ""}`}
                  className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-colors ${
                    p === currentPage
                      ? "bg-[#0d4f4a] text-white shadow-xs"
                      : "border border-stone-300 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
                  className="px-4 py-2 text-xs font-bold border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Sau →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <LuoiFooter />
    </div>
  );
}
