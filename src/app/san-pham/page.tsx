import { db } from "@/lib/db";
import Header from "@/components/Header";
import LuoiFooter from "@/components/LuoiFooter";
import Link from "next/link";
import { Metadata } from "next";
import {
  ShoppingBag,
  Star,
  ExternalLink,
  Tag,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sản Phẩm Tiện Ích | Lười Dọn Nhà",
  description:
    "Khám phá sản phẩm gia dụng tiện ích được chọn lọc kỹ càng – giúp nhà cửa gọn gàng, tiết kiệm thời gian. Mua qua link affiliate giá tốt nhất!",
  alternates: { canonical: "https://luoidonnha.com/san-pham" },
};

export default async function ProductsPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ merchant?: string }>;
}) {
  const { merchant: merchantFilter } = await searchParams;

  const whereClause: any = {};
  if (merchantFilter && merchantFilter !== "all") {
    whereClause.merchant = merchantFilter;
  }

  const [products, deals] = await Promise.all([
    db.product.findMany({
      where: whereClause,
      orderBy: [{ isFeatured: "desc" }, { clicks: "desc" }],
      include: { category: true },
      take: 24,
    }),
    db.deal.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const merchants = ["Shopee", "Lazada", "Tiki"];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-gradient-to-b from-[#fef3c7]/60 to-[#fafaf9] pt-10 pb-8 px-4">
          <div className="max-w-[1240px] mx-auto">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 uppercase tracking-wider mb-3">
              <ShoppingBag size={15} />
              <span>Sản Phẩm Tiện Ích</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 mb-3 leading-tight">
              Đồ Gia Dụng Thông Minh –{" "}
              <span className="bg-gradient-to-r from-[#0d4f4a] to-amber-600 bg-clip-text text-transparent">
                Mua Sắm Thông Thái
              </span>
            </h1>
            <p className="text-stone-500 text-sm max-w-2xl leading-relaxed">
              Tổng hợp sản phẩm tiện ích được chọn lọc kỹ, review thực tế – mua qua link để nhận ưu đãi tốt nhất từ Shopee, Lazada, Tiki.
            </p>
          </div>
        </section>

        <div className="max-w-[1240px] mx-auto px-4 pb-16 font-mono">
          {/* Hot Deals Banner */}
          {deals.length > 0 && (
            <div className="mb-10 bg-[#0d4f4a] rounded-3xl p-6 text-white shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-amber-300" />
                <h2 className="font-bold font-serif text-base">Mã Giảm Giá Đang Hot</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {deals.map((deal) => (
                  <a
                    key={deal.id}
                    href={`/api/affiliate/click?url=${encodeURIComponent(deal.affiliateUrl)}&merchant=${deal.merchant}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/15 border border-white/30 rounded-2xl p-3 text-center hover:bg-white/25 transition-all group"
                  >
                    <div className="text-xs font-bold text-amber-300 mb-1">
                      {deal.merchant}
                    </div>
                    <div className="font-black text-lg leading-tight">
                      {deal.discount}
                    </div>
                    <div className="text-[10px] mt-1 text-white/70 font-mono">
                      {deal.code}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Merchant Filter */}
          <div className="flex items-center gap-2 flex-wrap py-4 border-b border-stone-200 mb-8 font-mono">
            <Link
              href="/san-pham"
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                !merchantFilter || merchantFilter === "all"
                  ? "bg-[#0d4f4a] text-white shadow-xs"
                  : "bg-white border border-stone-300 text-stone-600 hover:border-[#0d4f4a] hover:text-[#0d4f4a]"
              }`}
            >
              Tất cả ({products.length})
            </Link>
            {merchants.map((m) => (
              <Link
                key={m}
                href={`/san-pham?merchant=${m}`}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  merchantFilter === m
                    ? "bg-[#0d4f4a] text-white shadow-xs"
                    : "bg-white border border-stone-300 text-stone-600 hover:border-[#0d4f4a] hover:text-[#0d4f4a]"
                }`}
              >
                {m}
              </Link>
            ))}
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag size={30} />
              </div>
              <h2 className="text-xl font-bold text-stone-800">
                Chưa có sản phẩm nào thuộc danh mục này
              </h2>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#0d4f4a]/30 transition-all group flex flex-col"
                >
                  {/* Image */}
                  {product.image ? (
                    <div className="h-44 overflow-hidden bg-stone-100 relative">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.isFeatured && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <TrendingUp size={9} /> HOT
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center relative">
                      <ShoppingBag size={36} className="text-stone-300" />
                      {product.isFeatured && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <TrendingUp size={9} /> HOT
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1 space-y-2">
                    {/* Merchant & Category */}
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0d4f4a]/10 text-[#0d4f4a] rounded-lg border border-[#0d4f4a]/30 uppercase">
                        {product.merchant}
                      </span>
                      {product.category && (
                        <span className="text-[10px] font-semibold text-stone-400">
                          {product.category.name}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-stone-900 text-xs leading-snug line-clamp-2 flex-1 font-sans">
                      {product.title}
                    </h3>

                    {/* Rating + Clicks */}
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star size={10} className="fill-current" />
                        {product.rating}
                      </span>
                      <span>{product.clicks} lượt mua</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 font-mono">
                      {product.price ? (
                        <>
                          <span className="font-black text-[#0d4f4a] text-sm">
                            {product.price.toLocaleString("vi-VN")}đ
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] line-through text-stone-400">
                              {product.originalPrice.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-stone-400">
                          Xem giá
                        </span>
                      )}
                    </div>

                    {/* Buy Button */}
                    <a
                      href={`/api/affiliate/click?url=${encodeURIComponent(product.affiliateUrl)}&merchant=${product.merchant}&productId=${product.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-auto py-2 bg-[#0d4f4a] hover:bg-[#083b37] text-white text-[11px] font-mono font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <ExternalLink size={11} />
                      Mua ngay {product.merchant}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back to home CTA */}
          <div className="mt-14 text-center bg-white border border-stone-200 rounded-3xl p-8 shadow-xs font-mono">
            <Tag size={28} className="text-[#0d4f4a] mx-auto mb-3" />
            <h3 className="font-bold font-serif text-lg text-stone-900 mb-2">
              Nhận Mã Giảm Giá Tự Động
            </h3>
            <p className="text-stone-500 text-sm mb-4 font-sans">
              Dán link sản phẩm Shopee vào công cụ bên dưới để tự động tìm mã giảm giá tốt nhất!
            </p>
            <Link
              href="/#tool-widget"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-mono font-bold rounded-xl transition-colors shadow-xs text-sm"
            >
              Dùng Công Cụ Miễn Phí <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>

      <LuoiFooter />
    </div>
  );
}
