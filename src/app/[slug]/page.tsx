import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import Header from "@/components/Header";
import LuoiFooter from "@/components/LuoiFooter";
import TrustBadges from "@/components/TrustBadges";
import ShortcodeContentParser from "@/components/ShortcodeContentParser";
import LuckyWheelBlock from "@/components/LuckyWheelBlock";
import ImageComparisonBlock from "@/components/ImageComparisonBlock";
import VietQRCheckoutBlock from "@/components/VietQRCheckoutBlock";
import PuckPageRenderer from "@/components/PuckPageRenderer";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Tag,
  HelpCircle,
  Mail,
  Play,
  Clock,
  CheckCircle2,
  Send,
  Star,
  Shield,
  Zap,
  Folder,
  Calendar,
  ArrowRight,
  Inbox,
  ArrowLeft,
  User,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

// Helper to format line breaks & paragraphs for clean article layout
function formatArticleHtmlContent(rawContent: string): string {
  if (!rawContent) return "";

  let html = rawContent;
  // If content does not have <p> tags, convert double linebreaks to <p> and single to <br>
  if (!html.includes("<p>") && !html.includes("<p ") && !html.includes("<div")) {
    html = html
      .split(/\n\n+/)
      .map((para) => `<p class="mb-4 leading-relaxed">${para.trim().replace(/\n/g, "<br />")}</p>`)
      .join("");
  }
  return html;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonicalUrl = `https://luoidonnha.com/${slug}`;

  // 1. Check if slug is a Category
  const category = await db.category.findUnique({ where: { slug } });
  if (category) {
    return {
      title: `${category.name} | Lười Dọn Nhà`,
      description: category.description || `Danh mục ${category.name} tại LuoiDonNha.com`,
      alternates: { canonical: canonicalUrl },
    };
  }

  // 2. Check if slug is a Static Page
  const page = await db.page.findUnique({ where: { slug } });
  if (page) {
    return {
      title: page.seoTitle || page.title + " | Lười Dọn Nhà",
      description: page.seoDescription || "Trang " + page.title + " tại LuoiDonNha.com",
      alternates: { canonical: canonicalUrl },
    };
  }

  // 3. Check if slug is a Post / Article
  const post = await db.post.findUnique({ where: { slug } });
  if (post) {
    return {
      title: post.seoTitle || post.title + " | Lười Dọn Nhà",
      description: post.seoDescription || post.summary || "Bài viết " + post.title + " tại LuoiDonNha.com",
      alternates: { canonical: canonicalUrl },
    };
  }

  return { title: "Không tìm thấy trang - Lười Dọn Nhà" };
}

export default async function UniversalTopLevelSlugPage({ params }: Props) {
  const { slug } = await params;

  // Reserved admin or system paths
  if (["admin", "api", "_next"].includes(slug)) {
    notFound();
  }

  // -------------------------------------------------------------
  // PATH TYPE 1: Category Page (domain.com/ten-danh-muc)
  // -------------------------------------------------------------
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (category) {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex flex-col font-sans">
        <Header />

        <main className="flex-1 max-w-6xl mx-auto px-4 py-12 space-y-10 font-mono">
          {/* Category Header Banner */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0d4f4a] uppercase tracking-wider">
              <Folder size={16} />
              <span>Danh mục bài viết</span>
            </div>
            <h1 className="text-3xl font-extrabold font-serif text-stone-900">{category.name}</h1>
            {category.description && (
              <div className="text-stone-600 text-sm leading-relaxed max-w-2xl font-sans">
                <ShortcodeContentParser html={category.description} />
              </div>
            )}
            <div className="pt-2 text-xs text-stone-500 font-mono">
              Tổng cộng: <strong className="text-stone-900">{category.posts.length}</strong> bài viết
            </div>
          </div>

          {/* Condition 1: Empty state */}
          {category.posts.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-stone-200 shadow-xs text-center space-y-4 max-w-2xl mx-auto my-8 font-mono">
              <div className="w-16 h-16 bg-[#0d4f4a]/10 text-[#0d4f4a] rounded-full flex items-center justify-center mx-auto border border-[#0d4f4a]/30">
                <Inbox size={32} />
              </div>
              <h2 className="text-xl font-bold font-serif text-stone-900">Chưa Có Nội Dung Bài Viết</h2>
              <p className="text-stone-500 text-xs leading-relaxed max-w-md mx-auto font-sans">
                Danh mục <strong>"{category.name}"</strong> hiện tại chưa có bài viết nào được xuất bản. Vui lòng quay lại sau.
              </p>
              <div className="pt-2 flex justify-center gap-3 font-mono">
                <Link
                  href="/"
                  className="px-6 py-2.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Về trang chủ →
                </Link>
              </div>
            </div>
          ) : (
            /* Condition 2: Articles Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
              {category.posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md hover:border-[#0d4f4a] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {post.coverImage && (
                      <div className="w-full h-48 bg-stone-100 rounded-2xl overflow-hidden mb-3">
                        <Image src={post.coverImage} alt={post.title} width={600} height={192} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={12} /> {post.readTimeMinutes || 5} phút đọc
                      </span>
                    </div>
                    <h2 className="text-xl font-bold font-serif text-stone-900 hover:text-[#0d4f4a] transition-colors">
                      <Link href={`/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.summary && (
                      <p className="text-stone-600 text-xs line-clamp-3 leading-relaxed font-sans">{post.summary}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between font-mono">
                    <span className="text-xs font-bold text-[#0d4f4a] uppercase tracking-wider">
                      {category.name}
                    </span>
                    <Link
                      href={`/${post.slug}`}
                      className="text-xs font-bold text-stone-900 hover:text-[#0d4f4a] flex items-center gap-1"
                    >
                      Đọc tiếp <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <TrustBadges />
        <LuoiFooter />
      </div>
    );
  }

  // -------------------------------------------------------------
  // PATH TYPE 2: Static Page / LadiPage UX Builder (domain.com/ten-trang)
  // -------------------------------------------------------------
  const page = await db.page.findUnique({
    where: { slug },
  });

  // Try to load Puck layout first
  const puckKey = `puck_layout_${slug}`;
  const puckSetting = await db.setting.findUnique({ where: { key: puckKey } });

    if (puckSetting?.value) {
      try {
        const puckData = JSON.parse(puckSetting.value);
        return (
          <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex flex-col font-sans">
            {page?.useDefaultHeader !== false && <Header />}
            <main className="flex-1">
              <PuckPageRenderer data={puckData} />
            </main>
            {page?.useDefaultFooter !== false && <LuoiFooter />}
          </div>
        );
      } catch {}
    }

  if (page && page.isPublished) {
    let blocks: any[] = [];
    try {
      if (page.blocks) {
        blocks = JSON.parse(page.blocks);
      }
    } catch {}

    const [products, deals] = await Promise.all([
      db.product.findMany({ take: 6, orderBy: { clicks: "desc" } }),
      db.deal.findMany({ take: 4, where: { isActive: true }, orderBy: { createdAt: "desc" } }),
    ]);

    return (
      <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex flex-col font-sans">
        {page.useDefaultHeader !== false && <Header />}

        <main className="flex-1">
          {(!blocks || blocks.length === 0) && (
            <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-12">
              <h1 className="text-3xl font-bold font-serif text-stone-900 mb-6">{page.title}</h1>
              {page.content ? (
                <div className="prose prose-[#0d4f4a] max-w-none text-stone-700 leading-relaxed space-y-4">
                  <ShortcodeContentParser html={page.content} />
                </div>
              ) : (
                <div className="p-8 bg-white border border-stone-200 rounded-2xl text-center text-stone-500 font-mono text-xs">
                  Trang này chưa có nội dung. Vui lòng vào Admin Portal để thiết kế!
                </div>
              )}
            </section>
          )}

          {blocks && blocks.length > 0 && (
            <div className="space-y-16 py-8">
              {blocks.map((block: any, idx: number) => {
                const customBg = block.bgColor || undefined;
                const customText = block.textColor || undefined;
                const customPrimary = block.primaryColor || "#0d4f4a";

                switch (block.type) {
                  case "hero":
                    return (
                      <section
                        key={idx}
                        style={{ backgroundColor: customBg, color: customText }}
                        className="bg-gradient-to-b from-[#042d2a] via-[#084540] to-[#0d4f4a] text-white py-20 px-4 rounded-3xl max-w-6xl mx-auto shadow-2xl relative overflow-hidden"
                      >
                        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
                          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00c9b7]/20 text-[#00c9b7] text-xs font-mono font-bold uppercase tracking-widest border border-[#00c9b7]/30">
                            <Sparkles size={14} />
                            {block.badge || "LadiPage & Webcake Premier Template"}
                          </span>
                          <h1 className="text-3xl md:text-5xl font-extrabold font-serif leading-tight">
                            {block.title || page.title}
                          </h1>
                          <p className="text-stone-200 text-base md:text-lg leading-relaxed">
                            {block.subtitle || "Tận hưởng không gian sống sạch sẽ mà không mất thời gian lau dọn."}
                          </p>
                          <div className="flex flex-wrap justify-center gap-4 pt-4 font-mono">
                            <a
                              href={block.ctaUrl || "#deals"}
                              style={{ backgroundColor: customPrimary }}
                              className="px-8 py-4 text-white font-bold rounded-xl shadow-xl transition-transform hover:-translate-y-0.5"
                            >
                              {block.ctaText || "Nhận Ưu Đãi Ngay"}
                            </a>
                          </div>
                        </div>
                      </section>
                    );

                  case "form":
                    const fields = block.formFields || [
                      { id: "f1", label: "Họ và tên", name: "name", type: "text", placeholder: "Nguyễn Văn A", required: true },
                      { id: "f2", label: "Số điện thoại", name: "phone", type: "tel", placeholder: "0912345678", required: true },
                    ];

                    return (
                      <section key={idx} className="max-w-2xl mx-auto px-4 font-mono">
                        <div
                          style={{ backgroundColor: customBg, color: customText }}
                          className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6"
                        >
                          <div className="text-center space-y-2">
                            <span style={{ color: customPrimary }} className="text-xs font-mono font-bold uppercase tracking-widest">
                              {block.badge || "Đăng Ký Tư Vấn"}
                            </span>
                            <h2 className="text-2xl font-bold font-serif">{block.title || "Form Đăng Ký Trải Nghiệm"}</h2>
                            <p className="text-xs opacity-75 font-sans">{block.subtitle}</p>
                          </div>
                          <form action="/api/contact" method="POST" className="space-y-4 text-xs">
                            {fields.map((f: any) => (
                              <div key={f.id}>
                                <label className="block font-bold mb-1">
                                  {f.label} {f.required && <span className="text-rose-500">*</span>}
                                </label>
                                {f.type === "textarea" ? (
                                  <textarea
                                    name={f.name}
                                    required={f.required}
                                    placeholder={f.placeholder}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-stone-300 text-stone-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] font-mono"
                                  />
                                ) : (
                                  <input
                                    type={f.type || "text"}
                                    name={f.name}
                                    required={f.required}
                                    placeholder={f.placeholder}
                                    className="w-full px-4 py-3 border border-stone-300 text-stone-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] font-mono"
                                  />
                                )}
                              </div>
                            ))}
                            <button
                              type="submit"
                              style={{ backgroundColor: customPrimary }}
                              className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 text-sm cursor-pointer"
                            >
                              {block.ctaText || "Gửi Thông Tin Ngay"}
                            </button>
                          </form>
                        </div>
                      </section>
                    );

                  case "deals":
                    return (
                      <section key={idx} className="max-w-6xl mx-auto px-4 font-mono">
                        <div className="text-center mb-8 space-y-2">
                          <h2 className="text-2xl md:text-3xl font-extrabold font-serif">{block.title || "Mã Giảm Giá Đang Hoạt Động"}</h2>
                          <p className="text-stone-500 text-xs font-sans">{block.subtitle || "Cập nhật liên tục mã giảm giá Shopee, Lazada & Tiki."}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(block.dealItems || []).map((deal: any, dIdx: number) => (
                            <div key={dIdx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0d4f4a]/10 text-[#0d4f4a] rounded-lg uppercase">
                                  {deal.merchant}
                                </span>
                                <h3 className="font-bold text-base">{deal.discount}</h3>
                                <p className="text-xs text-stone-500">{deal.description}</p>
                              </div>
                              <div className="pt-3 border-t flex items-center justify-between">
                                <code className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-1 rounded">
                                  {deal.code}
                                </code>
                                <a
                                  href={deal.affiliateUrl || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-[#0d4f4a] hover:underline"
                                >
                                  Lấy mã →
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    );

                  case "compare":
                    return <ImageComparisonBlock key={idx} title={block.title} subtitle={block.subtitle} />;

                  case "vietqr":
                    return <VietQRCheckoutBlock key={idx} title={block.title} subtitle={block.subtitle} />;

                  case "luckywheel":
                    return <LuckyWheelBlock key={idx} title={block.title} subtitle={block.subtitle} />;

                  case "html":
                    return (
                      <section key={idx} className="w-full max-w-6xl mx-auto px-4 md:px-8">
                        <ShortcodeContentParser html={block.htmlContent || ""} />
                      </section>
                    );

                  case "text":
                    return (
                      <section
                        key={idx}
                        style={{ backgroundColor: customBg, color: customText }}
                        className="w-full max-w-6xl mx-auto px-4 md:px-8 text-center space-y-3 py-6 rounded-2xl"
                      >
                        <h2 className="text-2xl md:text-4xl font-bold font-serif">{block.title}</h2>
                        <p className="text-sm md:text-base leading-relaxed opacity-80">{block.subtitle}</p>
                      </section>
                    );

                  case "button":
                    return (
                      <section key={idx} className="max-w-md mx-auto px-4 text-center">
                        <a
                          href={block.ctaUrl || "#"}
                          style={{ backgroundColor: customPrimary }}
                          className="w-full inline-block py-4 px-8 text-white font-bold text-base rounded-xl shadow-lg"
                        >
                          {block.ctaText || block.title || "Bấm Vào Đây"}
                        </a>
                      </section>
                    );

                  case "timer":
                    return (
                      <section key={idx} className="bg-gradient-to-r from-rose-600 to-amber-600 text-white py-10 px-6 rounded-3xl max-w-5xl mx-auto shadow-xl text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-200">
                          <Clock size={16} />
                          <span>{block.title || "Ưu Đãi Giới Hạn"}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold font-serif">{block.subtitle || "Kết Thúc Sau:"}</h2>
                        <div className="flex justify-center gap-3 font-mono">
                          <div className="bg-black/30 px-4 py-3 rounded-xl border border-white/20 text-center">
                            <span className="text-2xl md:text-3xl font-bold">02</span>
                            <span className="block text-[10px] text-stone-300">Giờ</span>
                          </div>
                          <div className="bg-black/30 px-4 py-3 rounded-xl border border-white/20 text-center">
                            <span className="text-2xl md:text-3xl font-bold">45</span>
                            <span className="block text-[10px] text-stone-300">Phút</span>
                          </div>
                        </div>
                      </section>
                    );

                  default:
                    return null;
                }
              })}
            </div>
          )}
        </main>

        <TrustBadges />
        {page.useDefaultFooter !== false && <LuoiFooter />}
      </div>
    );
  }

  // -------------------------------------------------------------
  // PATH TYPE 3: Blog Article / Post Detail (domain.com/ten-bai-viet)
  // -------------------------------------------------------------
  const post = await db.post.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
    },
  });

  if (post) {
    // Increment view counter in background
    db.post
      .update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      })
      .catch(() => {});
  }

  if (post && post.status === "PUBLISHED") {
    const formattedContent = formatArticleHtmlContent(post.content);

    return (
      <div className="min-h-screen bg-[#f7f4ed] text-[#1a1612] flex flex-col font-sans">
        <Header />

        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-8 md:py-12 space-y-8">
          <article className="space-y-6 bg-white p-6 sm:p-8 md:p-10 rounded-3xl border border-stone-200/90 shadow-xs overflow-visible w-full">
            {post.category && (
              <span className="inline-block px-3 py-1 bg-[#f7f4ed] text-[#0d4f4a] font-mono text-xs font-bold border border-[#0d4f4a]/30 rounded-lg">
                {post.category.name}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-[#1a1612] leading-snug tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#5c564f] font-mono pt-3 border-t border-[#d8d2c2]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#0d4f4a]" /> {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#0d4f4a]" /> {post.readTimeMinutes || 5} phút đọc
              </span>
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-[#0d4f4a]" /> LƯỜI CMS Editorial
              </span>
            </div>

            {post.summary && (
              <div className="p-4 bg-[#f7f4ed] border-l-4 border-[#0d4f4a] text-[#5c564f] font-serif italic text-sm sm:text-base leading-relaxed rounded-r-xl">
                {post.summary}
              </div>
            )}

            {/* Formatted Article Content with Compact Heading Sizes & Full Width Overflow Protection */}
            <div className="prose prose-stone max-w-full text-stone-800 text-sm sm:text-base leading-relaxed space-y-5 pt-2 prose-p:my-3 prose-p:leading-relaxed prose-h1:text-xl sm:prose-h1:text-2xl prose-h1:font-bold prose-h1:font-serif prose-h2:text-lg sm:prose-h2:text-xl md:prose-h2:text-2xl prose-h2:font-bold prose-h2:font-serif prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-stone-900 prose-h3:text-base sm:prose-h3:text-lg md:prose-h3:text-xl prose-h3:font-bold prose-h3:mt-5 prose-h3:mb-2 prose-img:rounded-2xl prose-img:my-4 prose-img:shadow-md prose-img:max-w-full prose-img:h-auto prose-ul:list-disc prose-ul:pl-5 prose-ul:my-3 prose-li:my-1 overflow-visible">
              <ShortcodeContentParser html={formattedContent} />
            </div>
          </article>
        </main>

        <TrustBadges />
        <LuoiFooter />
      </div>
    );
  }

  // If not found in Category, Page, or Post -> Return Clean Empty Category State or 404
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-teal-50 text-[#0d4f4a] rounded-full flex items-center justify-center mx-auto">
          <Inbox size={40} />
        </div>
        <h1 className="text-2xl font-bold font-serif text-stone-900">
          Chưa Có Nội Dung Bài Viết
        </h1>
        <p className="text-stone-500 text-xs leading-relaxed max-w-md mx-auto">
          Đường dẫn <strong>"/{slug}"</strong> chưa được xuất bản bài viết hoặc nội dung nào. Vui lòng quay lại trang chủ.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-[#0d4f4a] text-white font-bold text-xs rounded-xl hover:bg-[#083b37] transition-colors shadow-sm"
          >
            Về Trang Chủ →
          </Link>
        </div>
      </main>

      <TrustBadges />
      <LuoiFooter />
    </div>
  );
}
