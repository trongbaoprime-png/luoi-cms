"use client";

import React from "react";
import type { Config } from "@puckeditor/core";
import { DropZone } from "@puckeditor/core";
import { usePathname } from "next/navigation";
import ShortcodeContentParser from "@/components/ShortcodeContentParser";

// ── Block types ──────────────────────────────────────────────────────────────
type BaseProps = { bgColor?: string; textColor?: string };
type HeroProps = { heading?: string; subheading?: string; ctaText?: string; ctaUrl?: string } & BaseProps;
type TextProps = { text?: string; align?: "left" | "center" | "right" | "justify" } & BaseProps;
type HeadingProps = { text?: string; level?: "h1" | "h2" | "h3"; align?: "left" | "center" | "right" | "justify" } & BaseProps;
type CategoryBarProps = { items?: { label: string; icon: string; url: string }[] } & BaseProps;
type ReelVideoProps = { url?: string; title?: string; views?: string };
type ReelsRowProps = { title?: string; videos?: ReelVideoProps[] } & BaseProps;

type SpacerProps = { size?: "sm" | "md" | "lg" | "xl" } & BaseProps;

type DigitalProductPackage = {
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  note?: string;
};

type DigitalProductReview = {
  author: string;
  date: string;
  rating: number;
  comment: string;
};

type DigitalProductProps = {
  title?: string;
  subtitle?: string;
  categoryBadge?: string;
  image?: string;
  coverImage?: string;
  ratingScore?: string;
  ratingCount?: string;
  soldCount?: string;
  packages?: DigitalProductPackage[];
  descriptionHtml?: string;
  guideHtml?: string;
  warrantyHtml?: string;
  reviews?: DigitalProductReview[];
  buyUrl?: string;
  buyBtnText?: string;
  contactUrl?: string;
  contactBtnText?: string;
  badge1Text?: string;
  badge2Text?: string;
  badge3Text?: string;
  tab1Label?: string;
  tab2Label?: string;
  tab3Label?: string;
  tab4Label?: string;
  // Background Colors & Style Props
  outerBgColor?: string;
  innerCardBgColor?: string;
  itemBgColor?: string;
  primaryColor?: string;
} & BaseProps;

// Layout Blocks
type SectionProps = { bgColor?: string; bgImage?: string; paddingTop?: number; paddingBottom?: number; paddingLeft?: number; paddingRight?: number; marginTop?: number; marginBottom?: number; maxWidth?: "1280px" | "1536px" | "100%"; align?: "left" | "center" | "right"; textColor?: string; };
type RowProps = { columns: 1 | 2 | 3 | 4 | 5 | 6; gap?: number; };
type StackProps = { direction?: "row" | "col"; gap?: number; alignItems?: "start" | "center" | "end" | "stretch"; justifyContent?: "start" | "center" | "end" | "between" | "around"; wrap?: boolean; };
type DividerProps = { color?: string; thickness?: number; marginTop?: number; marginBottom?: number; style?: "solid" | "dashed" | "dotted"; };
type CustomHTMLProps = { html: string; };

// Header Blocks
type HeaderContainerProps = { bgColor?: string; maxWidth?: "1280px" | "1536px" | "100%" };
type HeaderLogoProps = { logoUrl?: string; height?: number; width?: number };
type HeaderMenuProps = { items?: { title: string; url: string }[]; alignment?: "left" | "center" | "right"; textSize?: number; textColor?: string; hoverColor?: string; activeColor?: string; };


// ── Block Renders ─────────────────────────────────────────────────────────────

function HeroBlock({ heading, subheading, ctaText, ctaUrl, bgColor, textColor }: HeroProps) {
  return (
    <section 
      className={`relative overflow-hidden py-12 px-4 sm:py-20 sm:px-8 ${!bgColor ? "bg-gradient-to-br from-[#f0fdfa] to-[#e6fffa]" : ""}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-3xl text-center space-y-5">
        <h1 className="text-3xl sm:text-5xl font-black leading-tight" style={{ color: textColor || "#0f172a" }}>
          {heading || "Nhà vẫn gọn, dù bạn rất lười."}
        </h1>
        <p className="text-base sm:text-xl font-medium leading-relaxed max-w-xl mx-auto" style={{ color: textColor || "#475569" }}>
          {subheading || "Mẹo hay – Sản phẩm tiện ích – Cuộc sống nhẹ nhàng hơn mỗi ngày"}
        </p>
        {ctaText && (
          <a
            href={ctaUrl || "#"}
            className="inline-flex items-center gap-2 bg-[#0d9488] text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg hover:bg-[#0f766e] transition-all"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function TextBlock({ text, align, bgColor, textColor }: TextProps) {
  return (
    <div className="py-4 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-3xl mx-auto">
        <p className={`text-base leading-relaxed text-${align}`} style={{ color: textColor || "#475569" }}>
          {text || "Nội dung đoạn văn..."}
        </p>
      </div>
    </div>
  );
}

function HeadingBlock({ text, level, align, bgColor, textColor }: HeadingProps) {
  const sizeMap: Record<string, string> = {
    h1: "text-4xl font-black",
    h2: "text-3xl font-bold",
    h3: "text-xl font-semibold",
  };
  const cls = `${sizeMap[level || "h2"] || "text-3xl font-bold"} text-${align || "center"}`;
  const content = text || "Tiêu đề...";
  return (
    <div className="py-4 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-3xl mx-auto">
        {level === "h1" ? (
          <h1 className={cls} style={{ color: textColor || "#0f172a" }}>{content}</h1>
        ) : level === "h3" ? (
          <h3 className={cls} style={{ color: textColor || "#0f172a" }}>{content}</h3>
        ) : (
          <h2 className={cls} style={{ color: textColor || "#0f172a" }}>{content}</h2>
        )}
      </div>
    </div>
  );
}

function CategoryBarBlock({ items, bgColor, textColor }: CategoryBarProps) {
  const defaultItems = [
    { label: "Mẹo Dọn Nhanh", icon: "🧹", url: "/meo-don-nha" },
    { label: "Robot Hút Bụi", icon: "🤖", url: "/robot-hut-bui" },
    { label: "Gia Dụng Thông Minh", icon: "🔌", url: "/gia-dung" },
    { label: "Voucher Hot", icon: "🏷️", url: "/voucher" },
  ];
  const list = items?.length ? items : defaultItems;
  return (
    <section className="py-6 px-4" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {list.map((item, i) => (
            <a
              key={i}
              href={item.url}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-stone-200 hover:border-[#0d9488] hover:shadow-md transition-all cursor-pointer"
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-sm font-bold text-center" style={{ color: textColor || "#334155" }}>{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}


function ReelItem({ video }: { video: ReelVideoProps }) {
  const [embedSrc, setEmbedSrc] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const rawUrl = video.url?.trim();
    if (!rawUrl) {
      setEmbedSrc("");
      return;
    }

    // 1. YouTube & Shorts
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      setEmbedSrc(`https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&enablejsapi=1`);
      return;
    }

    // 2. Facebook Reel & Video
    if (rawUrl.includes("facebook.com") || rawUrl.includes("fb.watch")) {
      setEmbedSrc(`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false`);
      return;
    }

    // 3. TikTok Direct Video
    const tkMatch = rawUrl.match(/tiktok\.com\/.*\/video\/(\d+)/);
    if (tkMatch && tkMatch[1]) {
      setEmbedSrc(`https://www.tiktok.com/embed/v2/${tkMatch[1]}`);
      return;
    }

    // 4. TikTok Shortlink (vt.tiktok.com/...) & async fallback
    if (rawUrl.startsWith("http")) {
      setLoading(true);
      fetch(`/api/resolve-video-url?url=${encodeURIComponent(rawUrl)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.embedUrl) {
            setEmbedSrc(data.embedUrl);
          } else {
            setEmbedSrc(rawUrl);
          }
        })
        .catch(() => {
          setEmbedSrc(rawUrl);
        })
        .finally(() => setLoading(false));
    }
  }, [video.url]);

  return (
    <div className="relative aspect-[9/14] rounded-2xl overflow-hidden bg-slate-900 border border-stone-200 shadow-md">
      {embedSrc ? (
        <iframe
          src={embedSrc}
          title={video.title || "Video"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4 space-y-2 bg-slate-900">
          <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-teal-300">Đang nhận dạng video...</p>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4 space-y-2 bg-gradient-to-br from-teal-900 to-slate-900">
          <span className="text-4xl">▶</span>
          <p className="text-xs font-bold text-teal-300">Chưa có URL video</p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <p className="text-white text-xs font-bold line-clamp-2">{video.title}</p>
        {video.views && <span className="text-slate-300 text-[10px]">👁 {video.views}</span>}
      </div>
    </div>
  );
}

function ReelsRowBlock({ title, videos, bgColor, textColor }: ReelsRowProps) {
  const defaultVideos: ReelVideoProps[] = [
    { url: "https://www.youtube.com/shorts/QeE6ufIsR80", title: "YouTube Shorts Mẫu", views: "15.4K" },
    { url: "https://www.facebook.com/reel/1050884634546805", title: "Facebook Reel Mẫu", views: "28.9K" },
    { url: "https://vt.tiktok.com/ZS42v9fVP/", title: "TikTok Reel Mẫu", views: "42.1K" },
    { url: "", title: "Top 5 Đồ Gia Dụng Đáng Tiền Nhất", views: "19.8K" },
  ];
  const list = videos?.length ? videos : defaultVideos;
  return (
    <section 
      className={`py-8 px-4 border-y border-stone-200 ${!bgColor ? "bg-gradient-to-b from-stone-50 via-[#f0fdfa]/30 to-stone-50" : ""}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-[1240px] space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: textColor || "#0f172a" }}>
            🎬 <span>{title || "Video Ngắn / Reels Mẹo Hay"}</span>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase rounded-full">HOT</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {list.map((video, i) => (
            <ReelItem key={i} video={video} />
          ))}
        </div>
      </div>
    </section>
  );
}



type ShopeeVoucherProps = {
  title: string;
  description: string;
  toolUrl: string;
  voucherDiscount?: string;
  voucherCondition?: string;
  voucherCode?: string;
  bgColor?: string;
  textColor?: string;
};

function ShopeeVoucherBlock({ title, description, toolUrl, voucherDiscount, voucherCondition, voucherCode, bgColor, textColor }: ShopeeVoucherProps) {
  const url = toolUrl || "https://qini-home.afp.ad/?theme=light";
  const [timeText, setTimeText] = React.useState("Đang kiểm tra khung giờ áp dụng tiếp theo…");

  React.useEffect(() => {
    const slots = [0, 9, 12, 15, 18, 20];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let nextHour = slots.find((hour) => hour * 60 > currentMinutes);
    let dayLabel = "hôm nay";
    if (nextHour === undefined) {
      nextHour = slots[0];
      dayLabel = "ngày mai";
    }
    setTimeText(
      `Voucher thường mở lúc 00:00, 09:00, 12:00, 15:00, 18:00 và 20:00. Mốc gần nhất: <strong>${String(
        nextHour
      ).padStart(2, "0")}:00 ${dayLabel}</strong>.`
    );
  }, []);

  return (
    <div className="w-full font-sans" style={{ backgroundColor: bgColor || "#ffffff", color: textColor || "#111827" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .shopee-voucher-container { max-width: 980px; margin: 0 auto; padding: 16px; }
        .shopee-hero { text-align: center; padding: 18px 8px 12px; }
        .shopee-hero h1 { margin: 0; font-size: clamp(24px,5vw,38px); line-height: 1.15; color: #0f5f78; letter-spacing: -0.5px; font-weight: bold; }
        .shopee-hero p { margin: 10px auto 0; max-width: 680px; color: #667085; line-height: 1.6; font-size: 15px; }
        .shopee-tool { background: #fff; border: 1px solid #f3d6ca; border-radius: 20px; box-shadow: 0 10px 28px rgba(15,23,42,.08); overflow: hidden; position: relative; }
        .shopee-badge { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid #f1f1f1; background: #fff; font-weight: 800; color: #0f5f78; }
        .shopee-badge::before { content: "✓"; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; background: #eafaf0; color: #16a34a; font-size: 13px; }
        .shopee-iframe-win { position: relative; overflow: hidden; height: 560px; background: #ffffff; }
        .shopee-iframe-win iframe { position: absolute; left: 0; top: -88px; width: 100%; height: 760px; border: 0; background: #fff; }
        .shopee-ticket { display: flex; align-items: stretch; background: #fff; border: 1px solid #ffdecc; border-radius: 8px; overflow: hidden; margin-bottom: 20px; position: relative; }
        .shopee-ticket::before, .shopee-ticket::after { content: ""; position: absolute; width: 16px; height: 16px; background: #fff; border: 1px solid #ffdecc; border-radius: 50%; top: 50%; transform: translateY(-50%); z-index: 1; }
        .shopee-ticket::before { left: -9px; } .shopee-ticket::after { right: -9px; }
        .shopee-ticket-left { width: 120px; background: #ff5722; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; }
        .shopee-ticket-right { flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: center; border-left: 2px dashed #ffdecc; }
        .shopee-time { display: flex; align-items: center; gap: 12px; margin-top: 14px; padding: 14px 16px; background: #ffffff; border: 1px solid #f3d6ca; border-radius: 16px; }
        .shopee-time-icon { width: 42px; height: 42px; flex: 0 0 42px; display: grid; place-items: center; border-radius: 50%; background: #fff1e8; font-size: 20px; }
      `}} />
      
      <div className="shopee-voucher-container">
        <section className="shopee-hero">
          <h1 style={{ color: textColor || "#0f5f78" }}>{title || "Shopee Voucher Facebook"}</h1>
          <p>{description || "Dán link sản phẩm Shopee để chuyển đổi và mở link mua hàng có ưu đãi."}</p>
        </section>

        {voucherDiscount && (
          <div className="shopee-ticket">
            <div className="shopee-ticket-left">
              <span className="text-xl font-black">SAVE</span>
            </div>
            <div className="shopee-ticket-right">
              <div className="text-lg font-bold text-[#ff5722]">{voucherDiscount}</div>
              <div className="text-xs text-gray-500">{voucherCondition}</div>
              {voucherCode && <div className="mt-2 text-sm font-mono font-bold bg-orange-100 px-2 py-1 inline-block rounded">{voucherCode}</div>}
            </div>
          </div>
        )}

        <section className="shopee-tool">
          <div className="shopee-badge">Dán link Shopee và chuyển đổi</div>
          <div className="shopee-iframe-win">
            <iframe
              src={url}
              title="Công cụ chuyển đổi link Shopee"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="clipboard-read; clipboard-write; encrypted-media; fullscreen"
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            />
          </div>
        </section>

        <section className="shopee-time">
          <div className="shopee-time-icon">⏰</div>
          <div>
            <strong>Khung giờ voucher Facebook</strong>
            <p dangerouslySetInnerHTML={{ __html: timeText }} />
          </div>
        </section>
      </div>
    </div>
  );
}

function PuckImageUploadField({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        onChange(data.data.url);
      } else {
        alert(data.error || "Tải ảnh lên thất bại");
      }
    } catch {
      alert("Lỗi kết nối máy chủ khi tải ảnh");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 font-sans">
      <div className="flex gap-1.5 items-center">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Dán URL ảnh hoặc bấm Tải ảnh..."
          className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#00c9b7]"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-2.5 py-1.5 bg-[#00c9b7] text-slate-950 font-bold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all text-xs whitespace-nowrap cursor-pointer shadow-2xs"
        >
          {uploading ? "Đang tải..." : "📤 Tải ảnh"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {value && (
        <div className="relative w-full h-24 bg-slate-900 rounded-xl overflow-hidden border border-stone-200 group flex items-center justify-center p-1">
          <img src={value} alt="Preview" className="max-w-full max-h-full object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-rose-700 transition-colors"
          >
            ✕ Xóa ảnh
          </button>
        </div>
      )}
    </div>
  );
}

function DigitalProductBlock({

  title,
  subtitle,
  categoryBadge,
  image,
  ratingScore,
  ratingCount,
  soldCount,
  packages,
  descriptionHtml,
  guideHtml,
  warrantyHtml,
  reviews,
  buyUrl,
  buyBtnText,
  contactUrl,
  contactBtnText,
  badge1Text,
  badge2Text,
  badge3Text,
  tab1Label,
  tab2Label,
  tab3Label,
  tab4Label,
  outerBgColor,
  innerCardBgColor,
  itemBgColor,
  primaryColor,
  bgColor,
  textColor,
}: DigitalProductProps) {
  const defaultPackages: DigitalProductPackage[] = [
    { name: "1 Tháng - Chính Chủ", price: "139.000đ", originalPrice: "249.000đ", badge: "TIẾT KIỆM 45%", note: "Nâng cấp trực tiếp qua Email Google cá nhân của bạn" },
    { name: "6 Tháng - Chính Chủ", price: "690.000đ", originalPrice: "1.350.000đ", badge: "BÁN CHẠY", note: "Bảo hành 1 đổi 1 trong suốt 6 tháng sử dụng" },
    { name: "12 Tháng - Chính Chủ", price: "1.290.000đ", originalPrice: "2.700.000đ", badge: "SIÊU RẺ", note: "Trọn gói 1 năm sử dụng Gemini Advanced 2.0 Pro" },
    { name: "Tài Khoản Cấp Sẵn (1 Tháng)", price: "49.000đ", originalPrice: "99.000đ", badge: "GIÁ RẺ", note: "Nhận tài khoản Gemini kích hoạt sẵn dùng ngay" },
  ];

  const defaultReviews: DigitalProductReview[] = [
    { author: "Quang Hải", date: "05/08/2026", rating: 5, comment: "Nâng cấp siêu nhanh, vừa chốt xong 3 phút là có mail xác nhận Gemini Advanced!" },
    { author: "Thanh Trúc", date: "02/08/2026", rating: 5, comment: "Shop hỗ trợ nhiệt tình, chính chủ 100% không bị out nhóm." },
    { author: "Minh Tuấn", date: "28/07/2026", rating: 5, comment: "Dùng ngon lành, viết code và sáng tạo nội dung siêu đỉnh!" },
  ];

  const pkgList = packages?.length ? packages : defaultPackages;
  const reviewList = reviews?.length ? reviews : defaultReviews;

  const [selectedPkgIndex, setSelectedPkgIndex] = React.useState<number>(0);
  const [activeTab, setActiveTab] = React.useState<"desc" | "guide" | "warranty" | "reviews">("desc");

  const currentPkg = pkgList[selectedPkgIndex] || pkgList[0];

  const themePrimary = primaryColor || "#00c9b7";
  const sectionBg = outerBgColor || bgColor || "#181635";
  const cardBg = innerCardBgColor || "#24214a";
  const itemBg = itemBgColor || "rgba(15, 23, 42, 0.75)";
  const txtColor = textColor || "#ffffff";

  return (
    <div className="w-full py-8 px-4 font-sans" style={{ backgroundColor: sectionBg, color: txtColor }}>
      <div className="max-w-[1140px] mx-auto space-y-6">
        
        {/* Top Header Card Container */}
        <div 
          style={{ backgroundColor: cardBg }} 
          className="rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col md:flex-row gap-6 items-start"
        >
          <div className="w-full md:w-56 h-56 bg-slate-900/80 rounded-2xl overflow-hidden shrink-0 border border-white/10 relative flex items-center justify-center">
            {image ? (
              <img src={image} alt={title || "Product"} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <span className="text-6xl">🤖</span>
                <p className="text-xs font-bold mt-2" style={{ color: themePrimary }}>GEMINI ADVANCED</p>
              </div>
            )}
            {categoryBadge && (
              <span 
                style={{ backgroundColor: themePrimary }}
                className="absolute top-3 left-3 px-2.5 py-1 text-slate-950 text-[10px] font-black uppercase rounded-lg shadow-sm"
              >
                {categoryBadge}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{ color: txtColor }}>
                {title || "Dịch Vụ Hỗ Trợ Nâng Cấp Gemini Advanced: Google AI"}
              </h1>
              <p className="text-sm opacity-80 mt-1">
                {subtitle || "Trí tuệ nhân tạo mạnh mẽ nhất từ Google — Hỗ trợ tạo nội dung, phân tích dữ liệu & viết code siêu tốc."}
              </p>
            </div>

            {/* Rating Badges */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <span>⭐</span>
                <span>{ratingScore || "4.9"}</span>
              </div>
              <span className="opacity-40">•</span>
              <span className="opacity-80 font-medium">{ratingCount || "1.4k"} đánh giá</span>
              <span className="opacity-40">•</span>
              <span className="font-bold" style={{ color: themePrimary }}>{soldCount || "⚡ Đã bán 3,820+ đơn"}</span>
            </div>

            {/* Variant Package Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-80">CHỌN GÓI SỬ DỤNG:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pkgList.map((pkg, idx) => {
                  const isSelected = idx === selectedPkgIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedPkgIndex(idx)}
                      style={{ 
                        backgroundColor: itemBg,
                        borderColor: isSelected ? themePrimary : "rgba(255, 255, 255, 0.1)"
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected ? "shadow-md ring-2" : "hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{pkg.name}</span>
                        {pkg.badge && (
                          <span className="px-2 py-0.5 bg-rose-500 text-white font-extrabold text-[9px] uppercase rounded-full">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-base font-black" style={{ color: themePrimary }}>{pkg.price}</span>
                        {pkg.originalPrice && (
                          <span className="text-xs opacity-50 line-through">{pkg.originalPrice}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Summary & Action Buttons */}
            <div 
              style={{ backgroundColor: itemBg }}
              className="p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4"
            >
              <div>
                <div className="text-[10px] uppercase font-bold opacity-60">GIÁ GÓI ĐANG CHỌN:</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black" style={{ color: themePrimary }}>{currentPkg.price}</span>
                  {currentPkg.originalPrice && (
                    <span className="text-sm opacity-50 line-through">{currentPkg.originalPrice}</span>
                  )}
                </div>
                {currentPkg.note && <div className="text-xs opacity-80 mt-0.5">{currentPkg.note}</div>}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={buyUrl || "#"}
                  style={{ backgroundColor: themePrimary }}
                  className="flex-1 sm:flex-initial px-6 py-3 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all text-center hover:brightness-110"
                >
                  {buyBtnText || "⚡ MUA NGAY"}
                </a>
                <a
                  href={contactUrl || "#"}
                  style={{ borderColor: `${themePrimary}40`, color: themePrimary }}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold rounded-xl border transition-all text-center"
                >
                  {contactBtnText || "💬 Zalo Tư Vấn"}
                </a>
              </div>
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px] font-semibold opacity-90">
              <div style={{ backgroundColor: itemBg }} className="flex items-center gap-1.5 justify-center p-2 rounded-xl border border-white/5">
                <span>{badge1Text || "🛡️ Bảo Hành 1 Đổi 1"}</span>
              </div>
              <div style={{ backgroundColor: itemBg }} className="flex items-center gap-1.5 justify-center p-2 rounded-xl border border-white/5">
                <span>{badge2Text || "⚡ Giao Hàng 5-15p"}</span>
              </div>
              <div style={{ backgroundColor: itemBg }} className="flex items-center gap-1.5 justify-center p-2 rounded-xl border border-white/5">
                <span>{badge3Text || "💬 Hỗ Trợ 24/7"}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation Section Container */}
        <div style={{ backgroundColor: cardBg }} className="rounded-3xl p-6 border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("desc")}
              style={{
                backgroundColor: activeTab === "desc" ? themePrimary : itemBg,
                color: activeTab === "desc" ? "#0f172a" : txtColor
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              {tab1Label || "📌 Mô Tả Sản Phẩm"}
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              style={{
                backgroundColor: activeTab === "guide" ? themePrimary : itemBg,
                color: activeTab === "guide" ? "#0f172a" : txtColor
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              {tab2Label || "📖 Hướng Dẫn Sử Dụng"}
            </button>
            <button
              onClick={() => setActiveTab("warranty")}
              style={{
                backgroundColor: activeTab === "warranty" ? themePrimary : itemBg,
                color: activeTab === "warranty" ? "#0f172a" : txtColor
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              {tab3Label || "🛡️ Chính Sách Bảo Hành"}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              style={{
                backgroundColor: activeTab === "reviews" ? themePrimary : itemBg,
                color: activeTab === "reviews" ? "#0f172a" : txtColor
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              {tab4Label ? `${tab4Label} (${reviewList.length})` : `⭐ Đánh Giá Khách Hàng (${reviewList.length})`}
            </button>
          </div>

          {/* Tab 1: Mô tả */}
          {activeTab === "desc" && (
            <div className="space-y-4 text-xs leading-relaxed opacity-90">
              {descriptionHtml ? (
                <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold" style={{ color: themePrimary }}>Tính năng nổi bật của gói Gemini Advanced 2.0 Pro:</h3>
                  <ul className="space-y-2 list-disc list-inside opacity-90">
                    <li>Sử dụng mô hình AI tiên tiến nhất Google Ultra 1.5 & 2.0 Pro với ngữ cảnh 1 Triệu tokens.</li>
                    <li>Sáng tạo nội dung văn bản, viết email, kịch bản video và dịch thuật chính xác.</li>
                    <li>Hỗ trợ lập trình viên: Viết code Python, JS, HTML, sửa lỗi & giải thích thuật toán.</li>
                    <li>Tích hợp trực tiếp vào hệ sinh thái Google Docs, Gmail, Drive & Google Slides.</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Hướng dẫn */}
          {activeTab === "guide" && (
            <div className="space-y-4 text-xs leading-relaxed opacity-90">
              {guideHtml ? (
                <div dangerouslySetInnerHTML={{ __html: guideHtml }} />
              ) : (
                <div className="space-y-4">
                  <div style={{ backgroundColor: itemBg }} className="p-4 rounded-2xl border border-white/10 space-y-2">
                    <h4 className="font-bold" style={{ color: themePrimary }}>1. Luồng nâng cấp tài khoản Gmail cá nhân:</h4>
                    <p className="opacity-80">Sau khi hoàn tất thanh toán, kiểm tra Email cá nhân của bạn để bấm nhận lời mời kích hoạt nhóm Gemini Advanced.</p>
                  </div>
                  <div style={{ backgroundColor: itemBg }} className="p-4 rounded-2xl border border-white/10 space-y-2">
                    <h4 className="font-bold" style={{ color: themePrimary }}>2. Luồng nhận tài khoản cấp sẵn:</h4>
                    <p className="opacity-80">Hệ thống gửi thông tin Đăng nhập (Email + Mật khẩu) qua tin nhắn/email. Bạn đăng nhập trực tiếp tại gemini.google.com để sử dụng ngay.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Bảo hành */}
          {activeTab === "warranty" && (
            <div className="space-y-4 text-xs leading-relaxed opacity-90">
              {warrantyHtml ? (
                <div dangerouslySetInnerHTML={{ __html: warrantyHtml }} />
              ) : (
                <div style={{ backgroundColor: itemBg }} className="space-y-3 p-4 rounded-2xl border border-white/10">
                  <h3 className="text-sm font-bold" style={{ color: themePrimary }}>Cam kết bảo hành MuaKey Standard:</h3>
                  <ul className="space-y-2 list-disc list-inside opacity-90">
                    <li>Bảo hành 1 đổi 1 hoặc gia hạn lại trọn thời gian của gói đã mua.</li>
                    <li>Hỗ trợ kỹ thuật 24/7 qua Zalo Hotline chăm sóc khách hàng.</li>
                    <li>Không thay đổi mật khẩu hoặc vi phạm điều khoản sử dụng chung để giữ quyền bảo hành.</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Đánh giá */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reviewList.map((rev, idx) => (
                  <div key={idx} style={{ backgroundColor: itemBg }} className="p-4 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{rev.author}</span>
                      <span className="text-[10px] opacity-50">{rev.date}</span>
                    </div>
                    <div className="text-amber-400 text-xs">{"⭐".repeat(rev.rating || 5)}</div>
                    <p className="text-xs opacity-80 leading-relaxed">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
function SpacerBlock({ size, bgColor }: SpacerProps) {
  const heights = { sm: "h-8", md: "h-16", lg: "h-24", xl: "h-32" };
  return <div className={`w-full ${heights[size || "md"]}`} style={{ backgroundColor: bgColor }} />;
}

// ── Layout Builder Blocks ──────────────────────────────────────────────────────

function SectionBlock({ bgColor, bgImage, paddingTop, paddingBottom, paddingLeft, paddingRight, marginTop, marginBottom, maxWidth, align, textColor }: SectionProps) {
  return (
    <section 
      style={{ 
        backgroundColor: bgColor || "transparent", 
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: `${paddingTop ?? 48}px`,
        paddingBottom: `${paddingBottom ?? 48}px`,
        paddingLeft: `${paddingLeft ?? 16}px`,
        paddingRight: `${paddingRight ?? 16}px`,
        marginTop: `${marginTop ?? 0}px`,
        marginBottom: `${marginBottom ?? 0}px`,
        color: textColor || "inherit",
        textAlign: align || "left"
      }}
      className="w-full relative"
    >
      <div className="mx-auto w-full" style={{ maxWidth: maxWidth || "1280px" }}>
        <DropZone zone="section-content" />
      </div>
    </section>
  );
}

function RowBlock({ columns, gap }: RowProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
  } as Record<number, string>;
  return (
    <div className={`grid w-full ${gridCols[columns || 4]}`} style={{ gap: `${gap ?? 24}px` }}>
      {Array.from({ length: columns || 4 }).map((_, i) => (
        <div key={i} className="w-full flex flex-col">
          <DropZone zone={`col-${i}`} />
        </div>
      ))}
    </div>
  );
}

function StackBlock({ direction, gap, alignItems, justifyContent, wrap }: StackProps) {
  return (
    <div 
      className={`flex w-full`}
      style={{
        flexDirection: direction === "col" ? "column" : "row",
        gap: `${gap ?? 16}px`,
        alignItems: alignItems === "start" ? "flex-start" : alignItems === "end" ? "flex-end" : alignItems || "stretch",
        justifyContent: justifyContent === "start" ? "flex-start" : justifyContent === "end" ? "flex-end" : justifyContent === "between" ? "space-between" : justifyContent === "around" ? "space-around" : justifyContent || "flex-start",
        flexWrap: wrap ? "wrap" : "nowrap"
      }}
    >
      <DropZone zone="stack-content" />
    </div>
  );
}

function DividerBlock({ color, thickness, marginTop, marginBottom, style }: DividerProps) {
  return (
    <div style={{ marginTop: `${marginTop ?? 24}px`, marginBottom: `${marginBottom ?? 24}px`, width: "100%" }}>
      <hr style={{ borderColor: color || "#e5e7eb", borderWidth: `${thickness ?? 1}px 0 0 0`, borderStyle: style || "solid", width: "100%" }} />
    </div>
  );
}

function CustomHTMLBlock({ html }: CustomHTMLProps) {
  return (
    <div className="w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: html || "<div><!-- Custom HTML --></div>" }} />
  );
}

// ── Header Builder Blocks ──────────────────────────────────────────────────────



function HeaderContainerBlock({ bgColor, maxWidth }: HeaderContainerProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur-md" style={{ backgroundColor: bgColor }}>
      <nav className="mx-auto px-6 py-[14px]" style={{ maxWidth: maxWidth || "1280px" }}>
        <div className="w-full [&>div]:flex [&>div]:w-full [&>div]:items-center [&>div]:justify-between">
          <DropZone zone="header-elements" />
        </div>
      </nav>
    </header>
  );
}

function HeaderLogoBlock({ logoUrl, height, width }: HeaderLogoProps) {
  return (
    <div className="shrink-0 flex items-center gap-2.5">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Logo" 
          style={{ 
            height: height ? `${height}px` : '40px', 
            width: width ? `${width}px` : 'auto' 
          }} 
          className="object-contain transition-all" 
        />
      ) : (
        <>
          <span className="w-8 h-8 rounded-xl bg-[#0d9488] text-white flex items-center justify-center font-sans font-black text-sm shadow-sm">L</span>
          <span className="font-serif font-bold text-xl text-stone-900 tracking-tight">LOGO</span>
        </>
      )}
    </div>
  );
}

function HeaderMenuBlock({ items, alignment, textSize, textColor, hoverColor, activeColor }: HeaderMenuProps) {
  const alignClass = alignment === "left" ? "justify-start" : alignment === "center" ? "justify-center" : "justify-end";
  const list = items?.length ? items : [
    { title: "Trang chủ", url: "/" },
    { title: "Sản phẩm", url: "/products" },
    { title: "Liên hệ", url: "/contact" }
  ];
  
  const pathname = usePathname() || "";

  return (
    <div className={`hidden md:flex flex-1 px-8 ${alignClass}`}>
      <div className="flex items-center gap-7">
        {list.map((item, i) => {
          const isActive = pathname === item.url;
          return (
            <a 
              key={i} 
              href={item.url} 
              style={{
                fontSize: textSize ? `${textSize}px` : "13px",
                color: isActive ? (activeColor || "#0d9488") : (textColor || "#44403c"),
                '--hover-color': hoverColor || "#0d9488"
              } as React.CSSProperties}
              className={`font-sans font-bold transition-colors hover:text-[var(--hover-color)]`}
            >
              {item.title}
            </a>
          );
        })}
      </div>
    </div>
  );
}



// ── Footer Builder Blocks ──────────────────────────────────────────────────────

function FooterContainerBlock({ bgColor, textColor, maxWidth }: any) {
  return (
    <footer className="w-full border-t border-stone-200" style={{ backgroundColor: bgColor || "#ffffff", color: textColor || "#1c1917" }}>
      <div className="mx-auto px-6 py-12" style={{ maxWidth: maxWidth || "1280px" }}>
        <DropZone zone="footer-content" />
      </div>
    </footer>
  );
}



function FooterMenuBlock({ title, items }: any) {
  const list = items?.length ? items : [{ title: "Trang chủ", url: "/" }, { title: "Về chúng tôi", url: "/about" }];
  return (
    <div className="space-y-4 font-sans">
      {title && <h4 className="font-bold text-lg">{title}</h4>}
      <ul className="space-y-2">
        {list.map((item: any, i: number) => (
          <li key={i}>
            <a href={item.url} className="text-sm opacity-80 hover:opacity-100 hover:text-[#0d9488] transition-colors">{item.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterSocialIconsBlock({ title, items }: any) {
  const list = items?.length ? items : [
    { icon: "🌐", url: "#" },
    { icon: "📱", url: "#" },
    { icon: "▶️", url: "#" }
  ];
  return (
    <div className="space-y-4 font-sans">
      {title && <h4 className="font-bold text-lg">{title}</h4>}
      <div className="flex items-center gap-3">
        {list.map((item: any, i: number) => (
          <a key={i} href={item.url} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xl hover:bg-[#0d9488] hover:text-white transition-colors">
            {item.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Configuration ────────────────────────────────────────────────────────────

const styleFields = {
  bgColor: { type: "text", label: "Màu nền (Ví dụ: #ffffff, transparent, red...)" },
  textColor: { type: "text", label: "Màu chữ (Ví dụ: #000000, white...)" },
} as any;

export const puckConfig: Config<any> = {
  components: {
    // ───────────────────────── NỘI DUNG (CONTENT) ─────────────────────────
    HeroSection: {
      label: "🦥 Hero Banner",
      defaultProps: {
        heading: "Nhà vẫn gọn, dù bạn rất lười.",
        subheading: "Mẹo hay – Sản phẩm tiện ích – Cuộc sống nhẹ nhàng hơn mỗi ngày",
        ctaText: "KHÁM PHÁ ĐỒ HAY",
        ctaUrl: "#tool-widget",
      },
      fields: {
        heading: { type: "text", label: "Tiêu đề lớn" },
        subheading: { type: "textarea", label: "Mô tả phụ" },
        ctaText: { type: "text", label: "Nút bấm CTA" },
        ctaUrl: { type: "text", label: "Link nút bấm" },
        ...styleFields,
      },
      render: ({ heading, subheading, ctaText, ctaUrl, bgColor, textColor }: any) =>
        <HeroBlock heading={heading} subheading={subheading} ctaText={ctaText} ctaUrl={ctaUrl} bgColor={bgColor} textColor={textColor} />,
    },

    CategoryBar: {
      label: "📦 Thanh Danh Mục (4 ô)",
      defaultProps: {
        items: [
          { label: "Mẹo Dọn Nhanh", icon: "🧹", url: "/meo-don-nha" },
          { label: "Robot Hút Bụi", icon: "🤖", url: "/robot-hut-bui" },
          { label: "Gia Dụng Thông Minh", icon: "🔌", url: "/gia-dung" },
          { label: "Voucher Hot", icon: "🏷️", url: "/voucher" },
        ],
      },
      fields: {
        items: {
          type: "array",
          label: "Danh mục",
          arrayFields: {
            label: { type: "text", label: "Tên danh mục" },
            icon: { type: "text", label: "Icon emoji" },
            url: { type: "text", label: "Link URL" },
          },
        },
        ...styleFields,
      },
      render: ({ items, bgColor, textColor }: any) => <CategoryBarBlock items={items} bgColor={bgColor} textColor={textColor} />,
    },


    ShopeeFacebookVoucher: {
      label: "🎁 Voucher Shopee Facebook",
      defaultProps: {
        title: "Shopee Voucher Facebook",
        description: "Dán link sản phẩm Shopee để chuyển đổi và mở link mua hàng có ưu đãi.",
        toolUrl: "https://qini-home.afp.ad/?theme=light",
        voucherDiscount: "Giảm 22% Giảm tối đa 500kđ",
        voucherCondition: "Đơn tối thiểu 50kđ",
        voucherCode: "",
      },
      fields: {
        title: { type: "text", label: "Tiêu đề" },
        description: { type: "textarea", label: "Mô tả" },
        toolUrl: { type: "text", label: "Link công cụ đối tác" },
        voucherDiscount: { type: "text", label: "Mức giảm giá (Voucher)" },
        voucherCondition: { type: "text", label: "Điều kiện (Voucher)" },
        voucherCode: { type: "text", label: "Mã Voucher (nếu có, VD: SHOPEE50K)" },
        ...styleFields,
      },
      render: ({ title, description, toolUrl, voucherDiscount, voucherCondition, voucherCode, bgColor, textColor }: any) => (
        <ShopeeVoucherBlock 
          title={title} 
          description={description} 
          toolUrl={toolUrl} 
          voucherDiscount={voucherDiscount}
          voucherCondition={voucherCondition}
          voucherCode={voucherCode}
          bgColor={bgColor} 
          textColor={textColor} 
        />
      ),
    },

    DigitalProduct: {
      label: "🛍️ Sản Phẩm Số & Nâng Cấp (MuaKey Style)",
      defaultProps: {
        title: "Dịch Vụ Hỗ Trợ Nâng Cấp Gemini Advanced: Google AI",
        subtitle: "Trí tuệ nhân tạo mạnh mẽ nhất từ Google — Hỗ trợ tạo nội dung, phân tích dữ liệu & viết code siêu tốc.",
        categoryBadge: "CHÍNH HÃNG",
        ratingScore: "4.9",
        ratingCount: "1.4k",
        soldCount: "⚡ Đã bán 3,820+ đơn",
        buyBtnText: "⚡ MUA NGAY",
        buyUrl: "#checkout",
        contactBtnText: "💬 Zalo Tư Vấn",
        contactUrl: "https://zalo.me",
        badge1Text: "🛡️ Bảo Hành 1 Đổi 1",
        badge2Text: "⚡ Giao Hàng 5-15p",
        badge3Text: "💬 Hỗ Trợ 24/7",
        tab1Label: "📌 Mô Tả Sản Phẩm",
        tab2Label: "📖 Hướng Dẫn Sử Dụng",
        tab3Label: "🛡️ Chính Sách Bảo Hành",
        tab4Label: "⭐ Đánh Giá Khách Hàng",
        outerBgColor: "#181635",
        innerCardBgColor: "#24214a",
        itemBgColor: "rgba(15, 23, 42, 0.75)",
        primaryColor: "#00c9b7",
        textColor: "#ffffff",
        packages: [
          { name: "1 Tháng - Chính Chủ", price: "139.000đ", originalPrice: "249.000đ", badge: "TIẾT KIỆM 45%", note: "Nâng cấp trực tiếp qua Email Google cá nhân của bạn" },
          { name: "6 Tháng - Chính Chủ", price: "690.000đ", originalPrice: "1.350.000đ", badge: "BÁN CHẠY", note: "Bảo hành 1 đổi 1 trong suốt 6 tháng sử dụng" },
          { name: "12 Tháng - Chính Chủ", price: "1.290.000đ", originalPrice: "2.700.000đ", badge: "SIÊU RẺ", note: "Trọn gói 1 năm sử dụng Gemini Advanced 2.0 Pro" },
          { name: "Tài Khoản Cấp Sẵn (1 Tháng)", price: "49.000đ", originalPrice: "99.000đ", badge: "GIÁ RẺ", note: "Nhận tài khoản Gemini kích hoạt sẵn dùng ngay" },
        ],
        reviews: [
          { author: "Quang Hải", date: "05/08/2026", rating: 5, comment: "Nâng cấp siêu nhanh, vừa chốt xong 3 phút là có mail xác nhận Gemini Advanced!" },
          { author: "Thanh Trúc", date: "02/08/2026", rating: 5, comment: "Shop hỗ trợ nhiệt tình, chính chủ 100% không bị out nhóm." },
          { author: "Minh Tuấn", date: "28/07/2026", rating: 5, comment: "Dùng ngon lành, viết code và sáng tạo nội dung siêu đỉnh!" },
        ],
      },
      fields: {
        title: { type: "text", label: "Tên sản phẩm" },
        subtitle: { type: "textarea", label: "Mô tả ngắn" },
        categoryBadge: { type: "text", label: "Huy hiệu thể loại (VD: CHÍNH HÃNG, HOT)" },
        image: {
          type: "custom",
          label: "Ảnh sản phẩm (Dán URL hoặc Tải ảnh từ máy tính)",
          render: ({ value, onChange }: any) => (
            <PuckImageUploadField value={value} onChange={onChange} />
          ),
        },

        ratingScore: { type: "text", label: "Điểm đánh giá (VD: 4.9)" },
        ratingCount: { type: "text", label: "Số lượng đánh giá (VD: 1.4k)" },
        soldCount: { type: "text", label: "Nhãn đã bán (VD: ⚡ Đã bán 3,820+ đơn)" },
        buyBtnText: { type: "text", label: "Tên nút Mua ngay" },
        buyUrl: { type: "text", label: "Link nút Mua ngay" },
        contactBtnText: { type: "text", label: "Tên nút Tư vấn" },
        contactUrl: { type: "text", label: "Link nút Tư vấn" },
        badge1Text: { type: "text", label: "Huy hiệu tin cậy 1 (VD: 🛡️ Bảo Hành 1 Đổi 1)" },
        badge2Text: { type: "text", label: "Huy hiệu tin cậy 2 (VD: ⚡ Giao Hàng 5-15p)" },
        badge3Text: { type: "text", label: "Huy hiệu tin cậy 3 (VD: 💬 Hỗ Trợ 24/7)" },
        tab1Label: { type: "text", label: "Tên Tab 1 (Mô tả sản phẩm)" },
        tab2Label: { type: "text", label: "Tên Tab 2 (Hướng dẫn sử dụng)" },
        tab3Label: { type: "text", label: "Tên Tab 3 (Chính sách bảo hành)" },
        tab4Label: { type: "text", label: "Tên Tab 4 (Đánh giá khách hàng)" },
        outerBgColor: { type: "text", label: "Màu nền ngoài cùng (Nền 1 - VD: #181635, #0f172a, #ffffff)" },
        innerCardBgColor: { type: "text", label: "Màu nền 2 khối thẻ trong (Nền 2 - VD: #24214a, #1e293b, #f8fafc)" },
        itemBgColor: { type: "text", label: "Màu nền các ô chọn gói & khung giá (Nền 3 - VD: rgba(15, 23, 42, 0.75), #0f172a)" },
        primaryColor: { type: "text", label: "Màu điểm nhấn chủ đạo (VD: #00c9b7, #06b6d4, #10b981)" },
        packages: {
          type: "array",
          label: "Danh sách gói biến thể",
          getItemSummary: (item) => `${item.name || "Gói"} (${item.price || "0đ"})`,
          arrayFields: {
            name: { type: "text", label: "Tên gói" },
            price: { type: "text", label: "Giá khuyến mãi" },
            originalPrice: { type: "text", label: "Giá gốc (nếu có)" },
            badge: { type: "text", label: "Nhãn ưu đãi (VD: HOT, GIẢM 45%)" },
            note: { type: "textarea", label: "Ghi chú ngắn dưới giá" },
          },
        },
        descriptionHtml: { type: "textarea", label: "Nội dung Tab Mô tả (HTML/Text)" },
        guideHtml: { type: "textarea", label: "Nội dung Tab Hướng dẫn (HTML/Text)" },
        warrantyHtml: { type: "textarea", label: "Nội dung Tab Bảo hành (HTML/Text)" },
        reviews: {
          type: "array",
          label: "Danh sách đánh giá mẫu",
          getItemSummary: (item) => `${item.author || "Khách"} (${item.rating || 5}★)`,
          arrayFields: {
            author: { type: "text", label: "Tên người đánh giá" },
            date: { type: "text", label: "Ngày đánh giá" },
            rating: { type: "number", label: "Số sao (1-5)" },
            comment: { type: "textarea", label: "Nội dung nhận xét" },
          },
        },
        ...styleFields,
      },
      render: (props: any) => <DigitalProductBlock {...props} />,
    },


    ReelsVideoRow: {
      label: "🎬 Hàng Video Reels / Shorts",
      defaultProps: {
        videos: [
          { url: "", title: "Mẹo Dọn Phòng Khách Siêu Nhanh", views: "15.4K" },
          { url: "", title: "Review Robot Hút Bụi Tự Động", views: "28.9K" },
          { url: "", title: "Bí Quyết Giữ Răng Miệng Trắng Sáng", views: "42.1K" },
          { url: "", title: "Top 5 Đồ Gia Dụng Đáng Tiền Nhất", views: "19.8K" },
        ],
      },
      fields: {
        title: { type: "text", label: "Tiêu đề" },
        videos: {
          type: "array",
          label: "Danh sách video",
          arrayFields: {
            url: { type: "text", label: "URL video (YouTube Shorts / TikTok)" },
            title: { type: "text", label: "Tiêu đề video" },
            views: { type: "text", label: "Số lượt xem (ví dụ: 15.4K)" },
          },
        },
        ...styleFields,
      },
      render: ({ title, videos, bgColor, textColor }: any) => <ReelsRowBlock title={title} videos={videos} bgColor={bgColor} textColor={textColor} />,
    },

    Heading: {
      label: "📝 Tiêu Đề",
      defaultProps: { text: "Tiêu đề mới", level: "h2", align: "center" },
      fields: {
        text: { type: "text", label: "Nội dung tiêu đề" },
        level: {
          type: "select",
          label: "Cấp tiêu đề",
          options: [
            { label: "H1 - Lớn nhất", value: "h1" },
            { label: "H2 - Lớn", value: "h2" },
            { label: "H3 - Vừa", value: "h3" },
          ],
        },
        align: {
          type: "select",
          label: "Căn chỉnh",
          options: [
            { label: "Trái", value: "left" },
            { label: "Giữa", value: "center" },
            { label: "Phải", value: "right" },
            { label: "Căn đều 2 bên", value: "justify" },
          ],
        },
        ...styleFields,
      },
      render: ({ text, level, align, bgColor, textColor }: any) => <HeadingBlock text={text} level={level} align={align} bgColor={bgColor} textColor={textColor} />,
    },

    TextContent: {
      label: "✍️ Đoạn Văn",
      defaultProps: { text: "Nhập nội dung đoạn văn tại đây...", align: "left" },
      fields: {
        text: { type: "textarea", label: "Nội dung" },
        align: {
          type: "select",
          label: "Căn chỉnh",
          options: [
            { label: "Trái", value: "left" },
            { label: "Giữa", value: "center" },
            { label: "Phải", value: "right" },
            { label: "Căn đều 2 bên", value: "justify" },
          ],
        },
        ...styleFields,
      },
      render: ({ text, align, bgColor, textColor }: any) => <TextBlock text={text} align={align} bgColor={bgColor} textColor={textColor} />,
    },



    Spacer: {
      label: "↕️ Khoảng Trống",
      defaultProps: { size: "md" },
      fields: {
        size: {
          type: "select",
          label: "Kích thước",
          options: [
            { label: "Nhỏ (16px)", value: "sm" },
            { label: "Vừa (32px)", value: "md" },
            { label: "Lớn (48px)", value: "lg" },
            { label: "Cực Lớn (80px)", value: "xl" },
          ],
        },
        ...styleFields,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: ({ size, bgColor }: any) => <SpacerBlock size={size} bgColor={bgColor} />,
    },
    // ───────────────────────── HEADER BUILDER ─────────────────────────
    HeaderContainer: {
      label: "📱 Header: Khung Chứa (Container)",
      fields: {
        bgColor: { type: "text" },
        maxWidth: {
          type: "select",
          options: [
            { label: "1280px", value: "1280px" },
            { label: "1536px", value: "1536px" },
            { label: "Full (100%)", value: "100%" }
          ]
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: ({ bgColor, maxWidth }: any) => <HeaderContainerBlock bgColor={bgColor} maxWidth={maxWidth} />,
    },
    HeaderLogo: {
      label: "🖼️ Header: Logo",
      fields: {
        logoUrl: {
          type: "custom",
          label: "Ảnh Logo (Dán URL hoặc Tải ảnh từ máy tính)",
          render: ({ value, onChange }: any) => (
            <PuckImageUploadField value={value} onChange={onChange} />
          ),
        },
        height: { type: "number", label: "Chiều cao (px)" },
        width: { type: "number", label: "Chiều rộng (px) - Tùy chọn" }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: ({ logoUrl, height, width }: any) => <HeaderLogoBlock logoUrl={logoUrl} height={height} width={width} />,
    },
    HeaderMenu: {
      label: "🔗 Header: Menu Links",
      fields: {
        alignment: {
          type: "select",
          label: "Căn lề Menu",
          options: [
            { label: "Trái", value: "left" },
            { label: "Giữa", value: "center" },
            { label: "Phải", value: "right" }
          ]
        },
        textSize: { type: "number", label: "Kích thước chữ (px) - Mặc định 13px" },
        textColor: { type: "text", label: "Màu chữ thường (VD: #44403c)" },
        hoverColor: { type: "text", label: "Màu khi Hover (VD: #0d9488)" },
        activeColor: { type: "text", label: "Màu khi đang mở trang đó (Active)" },
        items: {
          type: "array",
          label: "Danh sách link",
          getItemSummary: (item) => item.title || "Menu Item",
          arrayFields: {
            title: { type: "text", label: "Tên Menu" },
            url: { type: "text", label: "Link URL" }
          }
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: ({ items, alignment, textSize, textColor, hoverColor, activeColor }: any) => <HeaderMenuBlock items={items} alignment={alignment} textSize={textSize} textColor={textColor} hoverColor={hoverColor} activeColor={activeColor} />,
    },
    // ───────────────────────── FOOTER BUILDER ─────────────────────────
    FooterContainer: {
      label: "🔻 Footer Box (Chứa nội dung Footer)",
      fields: {
        bgColor: { type: "text" },
        textColor: { type: "text" },
        maxWidth: {
          type: "select",
          options: [
            { label: "1280px", value: "1280px" },
            { label: "1536px", value: "1536px" },
            { label: "Full (100%)", value: "100%" }
          ]
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: ({ bgColor, textColor, maxWidth }: any) => <FooterContainerBlock bgColor={bgColor} textColor={textColor} maxWidth={maxWidth} />,
    },

    FooterMenu: {
      label: "🔻 Footer Link Menu",
      fields: {
        title: { type: "text", label: "Tiêu đề cột (VD: Hỗ trợ khách hàng)" },
        items: {
          type: "array",
          getItemSummary: (item) => item.title || "Link",
          arrayFields: {
            title: { type: "text", label: "Tên link" },
            url: { type: "text", label: "Đường dẫn" }
          }
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: ({ title, items }: any) => <FooterMenuBlock title={title} items={items} />,
    },
    FooterSocialIcons: {
      label: "🔻 Footer Icon Mạng Xã Hội",
      fields: {
        title: { type: "text", label: "Tiêu đề" },
        items: {
          type: "array",
          getItemSummary: (item) => item.icon || "Icon",
          arrayFields: {
            icon: { type: "text", label: "Icon Emoji (VD: 🌐, 📱, ▶️)" },
            url: { type: "text", label: "Đường dẫn" }
          }
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: ({ title, items }: any) => <FooterSocialIconsBlock title={title} items={items} />,
    },
    // ───────────────────────── BỐ CỤC (LAYOUT) ─────────────────────────
    Section: {
      label: "🟦 Bố cục: Section (Bao bọc)",
      defaultProps: { paddingTop: 48, paddingBottom: 48, paddingLeft: 16, paddingRight: 16, marginTop: 0, marginBottom: 0, maxWidth: "1280px", align: "left" },
      fields: {
        bgColor: { type: "text", label: "Màu nền (VD: #ffffff, transparent)" },
        bgImage: { type: "text", label: "Ảnh nền (URL)" },
        textColor: { type: "text", label: "Màu chữ chung (VD: #000000)" },
        paddingTop: { type: "number", label: "Padding Trên (px)" },
        paddingBottom: { type: "number", label: "Padding Dưới (px)" },
        paddingLeft: { type: "number", label: "Padding Trái (px)" },
        paddingRight: { type: "number", label: "Padding Phải (px)" },
        marginTop: { type: "number", label: "Margin Trên (px)" },
        marginBottom: { type: "number", label: "Margin Dưới (px)" },
        maxWidth: {
          type: "select",
          label: "Chiều rộng tối đa",
          options: [
            { label: "1280px (Tiêu chuẩn)", value: "1280px" },
            { label: "1536px (Rộng)", value: "1536px" },
            { label: "Tràn viền (100%)", value: "100%" },
          ]
        },
        align: {
          type: "select",
          label: "Căn lề nội dung",
          options: [
            { label: "Trái", value: "left" },
            { label: "Giữa", value: "center" },
            { label: "Phải", value: "right" },
          ]
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <SectionBlock {...props} />
    },
    Row: {
      label: "🔲 Bố cục: Hàng / Cột (Row)",
      defaultProps: { columns: 4, gap: 24 },
      fields: {
        columns: { type: "number", label: "Số lượng cột (1-6)" },
        gap: { type: "number", label: "Khoảng cách giữa các cột (px)" }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: ({ columns, gap }: any) => <RowBlock columns={columns} gap={gap} />
    },
    Stack: {
      label: "📚 Bố cục: Khối xếp (Stack)",
      defaultProps: { direction: "row", gap: 16, alignItems: "stretch", justifyContent: "start", wrap: true },
      fields: {
        direction: {
          type: "select",
          label: "Hướng xếp",
          options: [
            { label: "Ngang (Row)", value: "row" },
            { label: "Dọc (Column)", value: "col" }
          ]
        },
        gap: { type: "number", label: "Khoảng cách (px)" },
        alignItems: {
          type: "select",
          label: "Căn lề trục phụ",
          options: [
            { label: "Bắt đầu (Start)", value: "start" },
            { label: "Giữa (Center)", value: "center" },
            { label: "Kết thúc (End)", value: "end" },
            { label: "Kéo giãn (Stretch)", value: "stretch" }
          ]
        },
        justifyContent: {
          type: "select",
          label: "Căn lề trục chính",
          options: [
            { label: "Bắt đầu (Start)", value: "start" },
            { label: "Giữa (Center)", value: "center" },
            { label: "Kết thúc (End)", value: "end" },
            { label: "Đẩy ra xa (Between)", value: "between" },
            { label: "Đều nhau (Around)", value: "around" }
          ]
        },
        wrap: {
          type: "radio",
          label: "Tự động xuống dòng",
          options: [
            { label: "Có", value: true },
            { label: "Không", value: false }
          ]
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <StackBlock {...props} />
    },
    Divider: {
      label: "➖ Đường Kẻ (Divider)",
      defaultProps: { color: "#e5e7eb", thickness: 1, marginTop: 24, marginBottom: 24, style: "solid" },
      fields: {
        color: { type: "text", label: "Màu sắc (VD: #000)" },
        thickness: { type: "number", label: "Độ dày (px)" },
        marginTop: { type: "number", label: "Khoảng cách trên (px)" },
        marginBottom: { type: "number", label: "Khoảng cách dưới (px)" },
        style: {
          type: "select",
          label: "Kiểu nét",
          options: [
            { label: "Nét liền (Solid)", value: "solid" },
            { label: "Nét đứt thưa (Dashed)", value: "dashed" },
            { label: "Nét đứt chấm (Dotted)", value: "dotted" }
          ]
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <DividerBlock {...props} />
    },
    CustomHTML: {
      label: "⚙️ Mã HTML / Nhúng",
      defaultProps: { html: "" },
      fields: {
        html: { type: "textarea", label: "Mã HTML" }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: ({ html }: any) => <CustomHTMLBlock html={html} />
    }
  },
  categories: {
    content: {
      title: "🎨 Nội dung & Tiện ích",
      defaultExpanded: true,
      components: [
        "HeroSection",
        "CategoryBar",
        "ShopeeFacebookVoucher",
        "DigitalProduct",
        "ReelsVideoRow",
        "Heading",
        "TextContent",
        "Spacer",
        "ShortcodeBlock",
      ],
    },
    layout: {
      title: "🟦 Bố cục & Khung",
      defaultExpanded: false,
      components: ["Section", "Row", "Stack", "Divider", "CustomHTML"],
    },
    header: {
      title: "📱 Header Builder",
      defaultExpanded: false,
      components: ["HeaderContainer", "HeaderLogo", "HeaderMenu"],
    },
    footer: {
      title: "🔻 Footer Builder",
      defaultExpanded: false,
      components: ["FooterContainer", "FooterMenu", "FooterSocialIcons"],
    },
  },
};

export const getPuckConfig = (
  shortcodeOptions: { label: string; value: string }[] = []
): Config<any> => {
  return {
    ...puckConfig,
    components: {
      ...puckConfig.components,
      ShortcodeBlock: {
        label: "🧩 Cụm Tùy Biến (Shortcode)",
        defaultProps: { blockKey: "" },
        fields: {
          blockKey: {
            type: "select",
            label: "Chọn Block đã lưu",
            options: [
              { label: "-- Chọn một block --", value: "" },
              ...shortcodeOptions,
            ],
          },
        },
        render: ({ blockKey }: any) => {
          if (!blockKey) {
            return (
              <div className="p-4 bg-stone-100 border border-stone-200 border-dashed rounded text-center text-sm text-stone-500">
                Chưa chọn Block
              </div>
            );
          }
          return (
            <div className="relative">
              <ShortcodeContentParser html={`[block key="${blockKey}"]`} />
            </div>
          );
        },
      },
    },
  };
};
