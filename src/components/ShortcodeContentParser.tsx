"use client";

import React, { useState, useEffect } from "react";
import SmartPhoneInput from "./SmartPhoneInput";
import {
  CheckCircle2,
  PhoneCall,
  Gift,
  ShieldCheck,
  Sparkles,
  Send,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
  Percent,
  FormInput,
  Flame,
  Star,
  ArrowRight,
  User,
  RotateCw,
  Trophy,
  PartyPopper,
  X,
  Play,
} from "lucide-react";

// --- HELPER PARSER FOR SHORTCODE ATTRIBUTES ---
function parseShortcodeString(str: string): { tagName: string; attrs: Record<string, string> } | null {
  const trimmed = str.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return null;

  const spaceIdx = inner.search(/\s/);
  if (spaceIdx === -1) {
    return { tagName: inner.toLowerCase(), attrs: {} };
  }

  const tagName = inner.slice(0, spaceIdx).toLowerCase();
  const attrString = inner.slice(spaceIdx).trim();

  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9_-]+)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/g;
  let match;
  while ((match = attrRegex.exec(attrString)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[key] = val;
  }

  return { tagName, attrs };
}

export function getEffectClass(effect?: string) {
  if (effect === "pulse") return "cta-pulse";
  if (effect === "shimmer") return "cta-shimmer";
  if (effect === "ripple") return "cta-ripple";
  if (effect === "shake") return "cta-shake";
  return "";
}

export const handleCtaClick = (e: React.MouseEvent, url?: string) => {
  if (!url) return;

  // 1. POPUP FORM TRIGGER (popup:key or #popup or popup)
  if (url.startsWith("popup:") || url === "#popup" || url === "popup") {
    e.preventDefault();
    const formKey = url.startsWith("popup:") ? url.replace("popup:", "") : "form-header";
    window.dispatchEvent(
      new CustomEvent("open-cta-popup", {
        detail: { formBlockKey: formKey },
      })
    );
    return;
  }

  // 2. SMOOTH SCROLL TO DIV / CLASS / SECTION ID (#id or .class)
  if (url.startsWith("#") || url.startsWith(".")) {
    e.preventDefault();
    try {
      const targetEl = document.querySelector(url);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      } else {
        console.warn(`[ScrollTo] Element '${url}' không tìm thấy trên trang!`);
      }
    } catch {}
    return;
  }

  // 3. Normal links (tel:0901234567 or http...) handle natively!
};

export interface CustomColorsConfig {
  bg?: string;
  cardBg?: string;
  cardText?: string;
  titleColor?: string;
  textColor?: string;
  buttonBg?: string;
  buttonText?: string;
  borderColor?: string;
  badgeBg?: string;
  badgeText?: string;
  priceColor?: string;
  // HIGHLIGHT CARD CUSTOM COLORS (USER REQUIREMENT)
  highlightBg?: string;
  highlightText?: string;
  highlightPriceColor?: string;
  highlightButtonBg?: string;
  highlightButtonText?: string;
  highlightBadgeBg?: string;
  highlightBadgeText?: string;
  highlightBorderColor?: string;
}

// -------------------------------------------------------------
// 1. DYNAMIC PRICING TABLE COMPONENT (WITH BANNER & HIGHLIGHTS)
// -------------------------------------------------------------
export interface PricingColumnConfig {
  id?: string;
  name: string;
  subtitle?: string;
  price: string;
  unit?: string;
  isHighlighted?: boolean;
  badgeText?: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  effect?: string;
}

export interface DynamicPricingConfig {
  title?: string;
  subtitle?: string;
  badge?: string;
  bgImageUrl?: string;
  customColors?: CustomColorsConfig;
  banner?: {
    enabled: boolean;
    imageUrl?: string;
    badge?: string;
    headline?: string;
    subtitle?: string;
    ctaText?: string;
    ctaUrl?: string;
  };
  columns: PricingColumnConfig[];
}

export function DynamicPricingBlock({
  config,
  blockKey,
  provider,
  title,
}: {
  config?: DynamicPricingConfig;
  blockKey?: string;
  provider?: string;
  title?: string;
}) {
  const [activeConfig, setActiveConfig] = useState<DynamicPricingConfig | null>(config || null);
  const [loading, setLoading] = useState(!!blockKey && !config);

  useEffect(() => {
    if (config) {
      setActiveConfig(config);
    }
  }, [config]);

  useEffect(() => {
    if (blockKey && !config) {
      fetch(`/api/shortcode-blocks?key=${encodeURIComponent(blockKey)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.block?.configJson) {
            try {
              setActiveConfig(JSON.parse(data.block.configJson));
            } catch {}
          }
        })
        .finally(() => setLoading(false));
    }
  }, [blockKey, config]);

  if (loading) {
    return <div className="py-6 text-center text-xs font-mono text-stone-400">Đang tải bảng giá tùy biến...</div>;
  }

  // Fallback default config if none provided
  const pName = provider || "Lười Dọn Nhà";
  const defaultCols: PricingColumnConfig[] = [
    {
      name: "Dọn Theo Giờ",
      subtitle: "Gói Tiêu Chuẩn",
      price: "80.000đ",
      unit: "/giờ",
      features: ["Dọn dẹp phòng khách & phòng ngủ", "Lau sàn, rửa chén bát & gấp đồ", "Dụng cụ vệ sinh tiêu chuẩn"],
      ctaText: "Đặt Lịch Giờ →",
      ctaUrl: "tel:0901234567",
    },
    {
      name: "Căn Hộ / Nhà Phố",
      subtitle: "Gói Tổng Vệ Sinh",
      price: "1.290.000đ",
      unit: "/lần",
      isHighlighted: true,
      badgeText: "BÁN CHẠY NHẤT",
      features: [
        "Đội 3-4 nhân sự dọn sâu toàn diện",
        "Máy hút bụi công nghiệp 1800W",
        "Lau kính cao tầng & khử khuẩn nhà tắm",
        "Nghiệm thu đạt mới thanh toán",
      ],
      ctaText: "Đặt Tổng Vệ Sinh Ngay →",
      ctaUrl: "tel:0901234567",
    },
    {
      name: "Giặt Sofa & Nệm",
      subtitle: "Gói Chuyên Sâu",
      price: "350.000đ",
      unit: "/bộ",
      features: ["Giặt phun hút hơi nước nóng 140°C", "Phun sương Nano Ag+ diệt khuẩn 99.9%", "Thổi khô sấy nhanh sử dụng sau 2H"],
      ctaText: "Đặt Giặt Sofa →",
      ctaUrl: "tel:0901234567",
    },
  ];

  const cols = activeConfig?.columns && activeConfig.columns.length > 0 ? activeConfig.columns : defaultCols;
  const mainTitle = title || activeConfig?.title || `Báo Giá Dịch Vụ - Đối Tác ${pName}`;
  const subTitle = activeConfig?.subtitle || "Bảng giá tham khảo minh bạch, áp dụng chính sách bảo hành uy tín";
  const banner = activeConfig?.banner;
  const colors = activeConfig?.customColors;
  const bgImageUrl = activeConfig?.bgImageUrl;

  return (
    <div
      style={{
        backgroundColor: colors?.bg || undefined,
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: colors?.bg || bgImageUrl ? "24px" : undefined,
        borderRadius: colors?.bg || bgImageUrl ? "24px" : undefined,
      }}
      className="my-8 not-prose font-sans space-y-6"
    >
      {/* Optional Top Promo Banner - 2-Column Split Layout */}
      {banner && banner.enabled && (
        <div className="p-6 md:p-8 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white rounded-3xl shadow-xl border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Column 1 (5 Cols): Large Banner Image + Hotline Button */}
            <div className="md:col-span-5 space-y-3">
              {banner.imageUrl ? (
                <div className="w-full h-44 md:h-52 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30 bg-black/20">
                  <img src={banner.imageUrl} alt="Promo banner graphic" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-36 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center p-4 text-center">
                  <Flame size={40} className="text-amber-300 mb-1" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/90">Ưu Đãi Đặc Biệt</span>
                </div>
              )}

              {banner.ctaText && (
                <a
                  href={banner.ctaUrl || "tel:0901234567"}
                  className="w-full py-3 bg-white text-stone-900 hover:bg-stone-100 font-mono font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 tracking-wide cta-pulse cursor-pointer"
                >
                  <PhoneCall size={16} className="text-[#0d4f4a]" />
                  <span>{banner.ctaText}</span>
                </a>
              )}
            </div>

            {/* Column 2 (7 Cols): Offer Details */}
            <div className="md:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 text-white text-[10px] font-mono font-extrabold uppercase tracking-wider border border-white/30">
                <Gift size={13} />
                <span>{banner.badge || "ƯU ĐÃI THÁNG NÀY"}</span>
              </div>

              <h4 className="text-2xl md:text-3xl font-extrabold font-serif leading-tight">{banner.headline || "Giảm Ngay 20% Cho Đơn Hàng Đầu Tiên"}</h4>
              <p className="text-xs md:text-sm text-white/95 leading-relaxed">{banner.subtitle || "Nhập mã LUOI20OFF khi liên hệ tư vấn hôm nay."}</p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
                <span className="text-white/80 font-semibold">Mã ưu đãi:</span>
                <span className="px-3.5 py-1 bg-white text-stone-900 font-mono font-bold text-xs rounded-xl shadow-md border border-amber-200">
                  LUOI20OFF
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Pricing Header */}
      <div className="text-center space-y-1">
        <div
          style={{
            backgroundColor: colors?.badgeBg || undefined,
            color: colors?.badgeText || undefined,
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0d4f4a]/10 text-[#0d4f4a] rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-[#0d4f4a]/30"
        >
          <Percent size={14} />
          <span>{activeConfig?.badge || `BẢNG GIÁ NIÊM YẾT ${pName.toUpperCase()}`}</span>
        </div>
        <h4 style={{ color: colors?.titleColor || undefined }} className="text-2xl font-bold font-serif text-stone-900">{mainTitle}</h4>
        <p style={{ color: colors?.textColor || undefined }} className="text-xs text-stone-500 font-sans">{subTitle}</p>
      </div>

      {/* Pricing Columns Grid */}
      <div className={`grid grid-cols-1 ${cols.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : cols.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"} gap-5`}>
        {cols.map((col, idx) => {
          const isHighlight = !!col.isHighlighted;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: isHighlight
                  ? colors?.highlightBg || undefined
                  : colors?.cardBg || undefined,
                color: isHighlight
                  ? colors?.highlightText || undefined
                  : colors?.cardText || undefined,
                borderColor: isHighlight
                  ? colors?.highlightBorderColor || colors?.borderColor || undefined
                  : colors?.borderColor || undefined,
              }}
              className={`p-6 rounded-3xl flex flex-col justify-between transition-all relative overflow-hidden ${
                isHighlight
                  ? (!colors?.highlightBg ? "bg-gradient-to-b from-[#042d2a] via-[#084540] to-[#0d4f4a] text-white border-2 border-[#00c9b7] shadow-xl" : "border-2 shadow-xl")
                  : (!colors?.cardBg ? "bg-white text-stone-900 border border-stone-200 shadow-xs hover:border-[#0d4f4a]" : "border shadow-xs")
              }`}
            >
              {isHighlight && (
                <div
                  style={{
                    backgroundColor: colors?.highlightBadgeBg || undefined,
                    color: colors?.highlightBadgeText || undefined,
                  }}
                  className="absolute top-3 right-4 bg-[#00c9b7] text-[#042d2a] text-[9px] font-mono font-bold uppercase px-3 py-1 rounded-full shadow-xs"
                >
                  {col.badgeText || "NỔI BẬT NHẤT"}
                </div>
              )}

              <div className="space-y-3">
                <span
                  style={{
                    color: isHighlight
                      ? colors?.highlightPriceColor || undefined
                      : undefined,
                  }}
                  className={`text-[10px] font-mono font-extrabold uppercase tracking-widest ${
                    isHighlight ? (!colors?.highlightPriceColor ? "text-[#00c9b7]" : "") : "text-stone-400"
                  }`}
                >
                  {col.subtitle || `Gói số ${idx + 1}`}
                </span>
                <h5 className="text-xl font-bold font-serif">{col.name}</h5>
                <div
                  style={{
                    color: isHighlight
                      ? colors?.highlightPriceColor || undefined
                      : colors?.priceColor || undefined,
                  }}
                  className={`text-3xl font-black font-mono ${
                    isHighlight
                      ? (!colors?.highlightPriceColor ? "text-white" : "")
                      : (!colors?.priceColor ? "text-[#0d4f4a]" : "")
                  }`}
                >
                  {col.price} {col.unit && <span className={`text-xs font-normal font-sans ${isHighlight ? "text-stone-300" : "text-stone-500"}`}>{col.unit}</span>}
                </div>

                <ul className={`text-xs space-y-2.5 border-t pt-4 font-sans ${isHighlight ? "text-stone-300 border-stone-700/80" : "text-stone-600 border-stone-100"}`}>
                  {col.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2
                        size={15}
                        style={{
                          color: isHighlight
                            ? colors?.highlightPriceColor || undefined
                            : colors?.priceColor || undefined,
                        }}
                        className={`${isHighlight ? (!colors?.highlightPriceColor ? "text-[#00c9b7]" : "") : (!colors?.priceColor ? "text-[#0d4f4a]" : "")} shrink-0`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 font-mono">
                <a
                  href={col.ctaUrl || "tel:0901234567"}
                  onClick={(e) => handleCtaClick(e, col.ctaUrl)}
                  style={{
                    backgroundColor: isHighlight
                      ? colors?.highlightButtonBg || undefined
                      : colors?.buttonBg || undefined,
                    color: isHighlight
                      ? colors?.highlightButtonText || undefined
                      : colors?.buttonText || undefined,
                  }}
                  className={`w-full py-3.5 font-bold text-xs rounded-xl text-center transition-all block cursor-pointer ${
                    isHighlight
                      ? (!colors?.highlightButtonBg ? "bg-[#00c9b7] hover:bg-[#00b3a3] text-[#042d2a] shadow-md hover:-translate-y-0.5" : "shadow-md hover:-translate-y-0.5")
                      : (!colors?.buttonBg ? "bg-[#0d4f4a] hover:bg-[#083b37] text-white" : "shadow-xs")
                  } ${getEffectClass(col.effect)}`}
                >
                  {col.ctaText || "Đặt Ngay →"}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. STANDALONE PROMO BANNER COMPONENT
// -------------------------------------------------------------
export interface StandaloneBannerConfig {
  badge?: string;
  headline?: string;
  subtitle?: string;
  imageUrl?: string;
  couponCode?: string;
  ctaText?: string;
  ctaUrl?: string;
  gradient?: string;
  effect?: string;
  customColors?: CustomColorsConfig;
}

export function StandaloneBannerBlock({
  config,
  blockKey,
}: {
  config?: StandaloneBannerConfig;
  blockKey?: string;
}) {
  const [activeConfig, setActiveConfig] = useState<StandaloneBannerConfig | null>(config || null);
  const [loading, setLoading] = useState(!!blockKey && !config);

  useEffect(() => {
    if (config) setActiveConfig(config);
  }, [config]);

  useEffect(() => {
    if (blockKey && !config) {
      fetch(`/api/shortcode-blocks?key=${encodeURIComponent(blockKey)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.block?.configJson) {
            try {
              setActiveConfig(JSON.parse(data.block.configJson));
            } catch {}
          }
        })
        .finally(() => setLoading(false));
    }
  }, [blockKey, config]);

  if (loading) {
    return <div className="py-6 text-center text-xs font-mono text-stone-400">Đang tải Banner...</div>;
  }

  const badge = activeConfig?.badge || "ƯU ĐÃI THÁNG NÀY";
  const headline = activeConfig?.headline || "Giảm Ngay 20% Cho Đơn Hàng Đầu Tiên";
  const subtitle = activeConfig?.subtitle || "Nhập mã LUOI20OFF khi liên hệ tư vấn dọn dẹp căn hộ hôm nay.";
  const ctaText = activeConfig?.ctaText || "Gọi 0901.234.567";
  const ctaUrl = activeConfig?.ctaUrl || "tel:0901234567";
  const imageUrl = activeConfig?.imageUrl;
  const couponCode = activeConfig?.couponCode || "LUOI20OFF";
  const colors = activeConfig?.customColors;

  return (
    <div className="my-8 not-prose font-sans">
      <div
        style={{
          backgroundColor: colors?.bg || undefined,
          borderColor: colors?.borderColor || undefined,
        }}
        className="p-6 md:p-8 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white rounded-3xl shadow-xl border border-white/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Column 1 (5 Cols): Banner Image + Hotline Button */}
          <div className="md:col-span-5 space-y-3">
            {imageUrl ? (
              <div className="w-full h-44 md:h-52 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30 bg-black/20">
                <img src={imageUrl} alt="Banner graphic" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-36 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center p-4 text-center">
                <Gift size={40} className="text-amber-300 mb-1" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/90">Khuyến Mãi Hot</span>
              </div>
            )}

            <a
              href={ctaUrl}
              onClick={(e) => handleCtaClick(e, ctaUrl)}
              style={{
                backgroundColor: colors?.buttonBg || undefined,
                color: colors?.buttonText || undefined,
              }}
              className={`w-full py-3 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-mono font-bold text-xs rounded-xl shadow-xs transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer ${getEffectClass(activeConfig?.effect || "pulse")}`}
            >
              <PhoneCall size={16} /> {ctaText}
            </a>
          </div>

          {/* Column 2 (7 Cols): Offer Details */}
          <div className="md:col-span-7 space-y-3">
            <div
              style={{
                backgroundColor: colors?.badgeBg || undefined,
                color: colors?.badgeText || undefined,
              }}
              className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-mono font-extrabold uppercase tracking-wider border border-white/30"
            >
              <Flame size={12} /> {badge}
            </div>
            <h4 style={{ color: colors?.titleColor || undefined }} className="text-2xl md:text-3xl font-extrabold font-serif leading-tight">
              {headline}
            </h4>
            <p style={{ color: colors?.textColor || undefined }} className="text-xs md:text-sm text-white/95 leading-relaxed">
              {subtitle}
            </p>
            {couponCode && (
              <div className="pt-2 flex items-center gap-2 text-xs font-mono">
                <span className="text-white/80 font-semibold">Mã voucher:</span>
                <span className="px-3 py-1 bg-white text-stone-900 font-bold rounded-xl shadow-md border border-amber-200">{couponCode}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. STANDALONE BUTTON CTA COMPONENT
// -------------------------------------------------------------
export interface StandaloneButtonConfig {
  text?: string;
  url?: string;
  icon?: string;
  style?: string;
  align?: string;
  effect?: string;
  customColors?: CustomColorsConfig;
}

export function StandaloneButtonBlock({
  config,
  blockKey,
}: {
  config?: StandaloneButtonConfig;
  blockKey?: string;
}) {
  const [activeConfig, setActiveConfig] = useState<StandaloneButtonConfig | null>(config || null);
  const [loading, setLoading] = useState(!!blockKey && !config);

  useEffect(() => {
    if (config) setActiveConfig(config);
  }, [config]);

  useEffect(() => {
    if (blockKey && !config) {
      fetch(`/api/shortcode-blocks?key=${encodeURIComponent(blockKey)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.block?.configJson) {
            try {
              setActiveConfig(JSON.parse(data.block.configJson));
            } catch {}
          }
        })
        .finally(() => setLoading(false));
    }
  }, [blockKey, config]);

  if (loading) return null;

  const text = activeConfig?.text || "LIÊN HỆ ĐẶT LỊCH NGAY →";
  const url = activeConfig?.url || "tel:0901234567";
  const btnStyle = activeConfig?.style || "teal";
  const align = activeConfig?.align || "center";

  const getStyleClass = () => {
    if (btnStyle === "amber") return "bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md";
    if (btnStyle === "dark") return "bg-stone-900 hover:bg-stone-800 text-teal-300 shadow-md";
    if (btnStyle === "rose") return "bg-rose-600 hover:bg-rose-700 text-white shadow-md";
    if (btnStyle === "outline") return "bg-white hover:bg-stone-50 border-2 border-[#0d4f4a] text-[#0d4f4a]";
    return "bg-[#0d4f4a] hover:bg-[#083b37] text-white shadow-xs font-mono";
  };

  const getAlignClass = () => {
    if (align === "left") return "justify-start";
    if (align === "full") return "w-full justify-center";
    return "justify-center";
  };

  const colors = activeConfig?.customColors;

  return (
    <div className={`my-6 flex ${getAlignClass()} not-prose font-sans`}>
      <a
        href={url}
        onClick={(e) => handleCtaClick(e, url)}
        style={{
          backgroundColor: colors?.buttonBg || undefined,
          color: colors?.buttonText || undefined,
          borderColor: colors?.borderColor || undefined,
        }}
        className={`px-8 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-transform hover:-translate-y-0.5 flex items-center gap-2 ${getStyleClass()} ${getEffectClass(activeConfig?.effect)}`}
      >
        <PhoneCall size={16} />
        <span>{text}</span>
      </a>
    </div>
  );
}

// -------------------------------------------------------------
// 4. DYNAMIC CUSTOM FORM COMPONENT (FULLY CUSTOM FIELDS)
// -------------------------------------------------------------
export interface FormFieldConfig {
  id: string;
  label: string;
  name: string;
  type: "text" | "tel" | "email" | "select" | "textarea" | "date";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface DynamicFormConfig {
  title?: string;
  subtitle?: string;
  badge?: string;
  submitText?: string;
  successTitle?: string;
  successMsg?: string;
  bgImageUrl?: string;
  layout?: "1_COL" | "2_COL" | "SPLIT_IMAGE_FORM";
  sideImageUrl?: string;
  sideImagePos?: "left" | "right";
  antiSpamEnabled?: boolean;
  antiSpamText?: string;
  customColors?: CustomColorsConfig;
  fields: FormFieldConfig[];
}

export function DynamicFormBlock({
  config,
  blockKey,
}: {
  config?: DynamicFormConfig;
  blockKey?: string;
}) {
  const [activeConfig, setActiveConfig] = useState<DynamicFormConfig | null>(config || null);
  const [loading, setLoading] = useState(!!blockKey && !config);
  const [submitted, setSubmitted] = useState(false);
  const [verifiedAntiSpam, setVerifiedAntiSpam] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (config) setActiveConfig(config);
  }, [config]);

  useEffect(() => {
    if (blockKey && !config) {
      fetch(`/api/shortcode-blocks?key=${encodeURIComponent(blockKey)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.block?.configJson) {
            try {
              setActiveConfig(JSON.parse(data.block.configJson));
            } catch {}
          }
        })
        .finally(() => setLoading(false));
    }
  }, [blockKey, config]);

  if (loading) {
    return <div className="py-6 text-center text-xs font-mono text-stone-400">Đang tải Form đăng ký tùy biến...</div>;
  }

  const defaultFields: FormFieldConfig[] = [
    { id: "f1", label: "Họ và tên", name: "name", type: "text", placeholder: "VD: Nguyễn Văn A", required: true },
    { id: "f2", label: "Số điện thoại", name: "phone", type: "tel", placeholder: "VD: 0901 234 567", required: true },
    {
      id: "f_branch",
      label: "Chi Nhánh Gần Bạn",
      name: "branch",
      type: "select",
      options: [
        "Chi nhánh TP. Hồ Chí Minh",
        "Chi nhánh Hà Nội",
        "Chi nhánh Đà Nẵng",
        "Chi nhánh Cần Thơ",
        "Chi nhánh Bình Dương",
        "Chi nhánh Đồng Nai",
      ],
    },
    { id: "f3", label: "Nhu cầu tư vấn / Ghi chú", name: "note", type: "textarea", placeholder: "Nội dung dịch vụ hoặc thắc mắc cần hỗ trợ..." },
  ];

  const fields = activeConfig?.fields && activeConfig.fields.length > 0 ? activeConfig.fields : defaultFields;
  const formTitle = activeConfig?.title || "Đăng Ký Tư Vấn & Nhận Ưu Đãi 30%";
  const formSub = activeConfig?.subtitle || "Để lại thông tin để được hỗ trợ báo giá nhanh chóng trong ngày";
  const formBadge = activeConfig?.badge || "FORM TƯƠNG TÁC TÙY BIẾN";
  const submitText = activeConfig?.submitText || "GỬI ĐĂNG KÝ NGAY";
  const successMsg = activeConfig?.successMsg || "Đăng Ký Thành Công! Chuyên viên sẽ liên hệ hỗ trợ bạn trong 15 phút.";
  const layoutMode = activeConfig?.layout || "2_COL";
  const sideImage = activeConfig?.sideImageUrl;
  const sideImagePos = activeConfig?.sideImagePos || "left";
  const antiSpamEnabled = !!activeConfig?.antiSpamEnabled;
  const antiSpamText = activeConfig?.antiSpamText || "Tôi xác minh không phải là robot (Xác minh chống Spam)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (antiSpamEnabled && !verifiedAntiSpam) {
      alert("Vui lòng tích vào ô 'Xác minh chống Spam' trước khi gửi đăng ký!");
      return;
    }
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.name || "Khách đăng ký Form",
          phone: formValues.phone || "0900000000",
          note: JSON.stringify(formValues),
          source: "DYNAMIC_FORM_BLOCK",
        }),
      });
    } catch {}
    setSubmitted(true);
  };

  const formColors = activeConfig?.customColors;
  const isSplitLayout = layoutMode === "SPLIT_IMAGE_FORM" && !!sideImage;

  return (
    <div
      style={{
        backgroundColor: formColors?.bg || undefined,
        backgroundImage: activeConfig?.bgImageUrl ? `url("${activeConfig.bgImageUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderColor: formColors?.borderColor || undefined,
      }}
      className={`my-8 p-6 md:p-8 ${!formColors?.bg && !activeConfig?.bgImageUrl ? "bg-white text-stone-900 border border-stone-200/90" : "text-white"} rounded-3xl shadow-xl font-sans not-prose`}
    >
      {submitted ? (
        <div className="text-center py-8 space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="text-2xl font-bold text-stone-900 font-serif">
            {activeConfig?.successTitle || "Gửi Thông Tin Thành Công!"}
          </h4>
          <p className="text-stone-600 text-sm max-w-md mx-auto">{successMsg}</p>
        </div>
      ) : (
        <div className={isSplitLayout ? "grid grid-cols-1 md:grid-cols-12 gap-8 items-center" : "space-y-6"}>
          {/* Side Graphic Image for Split Layout (Matching User Image 3) */}
          {isSplitLayout && (
            <div className={`md:col-span-6 ${sideImagePos === "right" ? "md:order-2" : "md:order-1"}`}>
              <div className="w-full h-full min-h-[320px] md:min-h-[420px] rounded-2xl overflow-hidden shadow-2xl border-2 border-stone-100 bg-stone-100 relative">
                <img src={sideImage} alt={formTitle} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Main Form Fields Container */}
          <div className={isSplitLayout ? `md:col-span-6 space-y-6 ${sideImagePos === "right" ? "md:order-1" : "md:order-2"}` : "space-y-6"}>
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="w-10 h-10 rounded-2xl bg-[#0d4f4a] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FormInput size={20} />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0d4f4a] block">{formBadge}</span>
                <h4 style={{ color: formColors?.titleColor || undefined }} className="text-xl font-extrabold text-stone-900 font-serif">
                  {formTitle}
                </h4>
                <p style={{ color: formColors?.textColor || undefined }} className="text-xs text-stone-500 font-sans">
                  {formSub}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`grid gap-4 ${layoutMode === "1_COL" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
            >
              {fields.map((field) => (
                <div key={field.id} className={field.type === "textarea" || layoutMode === "1_COL" ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-bold text-stone-700 mb-1 font-mono">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>

                  {field.type === "select" ? (
                    <select
                      value={formValues[field.name] || ""}
                      onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                      required={field.required}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] font-mono"
                    >
                      <option value="">-- Chọn {field.label} --</option>
                      {(field.options || []).map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder}
                      value={formValues[field.name] || ""}
                      onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                      required={field.required}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] font-mono"
                    />
                  ) : field.type === "tel" || field.name === "phone" || field.name === "sdt" ? (
                    <SmartPhoneInput
                      value={formValues[field.name] || ""}
                      onChange={(val) => setFormValues({ ...formValues, [field.name]: val })}
                      required={field.required}
                      placeholder={field.placeholder}
                      inputStyleClass="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] font-mono"
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={formValues[field.name] || ""}
                      onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                      required={field.required}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] font-mono"
                    />
                  )}
                </div>
              ))}

              {/* Anti-Spam Verification Checkbox */}
              {antiSpamEnabled && (
                <div className="md:col-span-2 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2 text-xs font-mono">
                  <input
                    type="checkbox"
                    id="antiSpamCheck"
                    checked={verifiedAntiSpam}
                    onChange={(e) => setVerifiedAntiSpam(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#0d4f4a] focus:ring-[#0d4f4a]"
                  />
                  <label htmlFor="antiSpamCheck" className="text-stone-700 font-medium cursor-pointer flex items-center gap-1.5">
                    <span className="text-amber-500">🛡️</span>
                    <span>{antiSpamText}</span>
                  </label>
                </div>
              )}

              <div className="md:col-span-2 pt-2 font-mono">
                <button
                  type="submit"
                  style={{
                    backgroundColor: formColors?.buttonBg || undefined,
                    color: formColors?.buttonText || undefined,
                  }}
                  className="w-full py-3.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send size={15} /> {submitText}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 5. PROVIDER OFFERS BLOCK
// -------------------------------------------------------------
export function ProviderOffersBlock({ provider = "shopee", title, limit }: { provider?: string; title?: string; limit?: string }) {
  const [deals, setDeals] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/deals?merchant=${encodeURIComponent(provider)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const max = limit ? parseInt(limit, 10) : 4;
          setDeals(data.slice(0, max));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [provider, limit]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getProviderColor = (pName: string) => {
    const lower = pName.toLowerCase();
    if (lower.includes("shopee")) return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", btn: "bg-orange-600 hover:bg-orange-700" };
    if (lower.includes("lazada")) return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", btn: "bg-blue-600 hover:bg-blue-700" };
    if (lower.includes("btaskee")) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", btn: "bg-amber-600 hover:bg-amber-700" };
    return { bg: "bg-teal-50", border: "border-teal-200", text: "text-[#0d9488]", btn: "bg-[#0d9488] hover:bg-[#0f766e]" };
  };

  const colors = getProviderColor(provider);

  return (
    <div className="my-8 p-6 bg-white rounded-3xl border border-stone-200 shadow-md font-sans not-prose space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <span className={`w-10 h-10 rounded-2xl ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center shrink-0`}>
            <Gift size={20} />
          </span>
          <div>
            <h4 className="text-lg font-bold font-serif text-stone-900">
              {title || `Chương Trình Ưu Đãi & Voucher Hot - Nhà Cung Cấp ${provider.toUpperCase()}`}
            </h4>
            <p className="text-xs text-stone-500">Mã giảm giá độc quyền đã được xác minh tính hiệu lực</p>
          </div>
        </div>
        <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
          {provider.toUpperCase()} SPECIAL
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-stone-400 font-mono">Đang tải mã ưu đãi tốt nhất...</div>
      ) : deals.length === 0 ? (
        <div className="py-6 text-center text-xs text-stone-500">Chưa có mã voucher khả dụng cho nhà cung cấp này.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((deal) => {
            const isCopied = copiedCode === deal.code;
            return (
              <div key={deal.id || deal.code} className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80 flex flex-col justify-between gap-3 hover:border-stone-300 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {deal.discount || "GIẢM SÂU"}
                    </span>
                    {deal.isHot && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500 text-white">
                        HOT DEAL
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-stone-900 text-sm leading-snug">{deal.title}</h5>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-dashed border-stone-300 font-mono text-xs font-bold text-stone-800">
                    <Tag size={13} className="text-stone-400" />
                    <span>{deal.code}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(deal.code)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-teal-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      {isCopied ? <Check size={13} /> : <Copy size={13} />}
                      {isCopied ? "Đã copy" : "Copy"}
                    </button>
                    {deal.affiliateUrl && (
                      <a
                        href={deal.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${colors.btn}`}
                      >
                        <span>Dùng ngay</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 6. PROMOTIONAL MULTI-CARD & 3D COVERFLOW SLIDER COMPONENT
// -------------------------------------------------------------
export interface SlideItemConfig {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price?: string;
  badge?: string;
  voucherCode?: string;
  imageUrl?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showDescription?: boolean;
  showBadge?: boolean;
  showVoucherCode?: boolean;
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
}

export interface DynamicSliderConfig {
  title?: string;
  subtitle?: string;
  bgImageUrl?: string;
  layout?: "CARD_GRID" | "COVERFLOW" | "HERO_BANNER" | "VOUCHER_SWIPER";
  showBottomCta?: boolean;
  bottomCtaText?: string;
  bottomCtaUrl?: string;
  customColors?: CustomColorsConfig;

  // Global display element visibility toggles
  showImage?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showDescription?: boolean;
  showBadge?: boolean;
  showVoucherCode?: boolean;
  showSlideCta?: boolean;

  slides: SlideItemConfig[];
}

export function PromotionalSliderBlock({
  config,
  blockKey,
  provider = "all",
  title,
}: {
  config?: DynamicSliderConfig;
  blockKey?: string;
  provider?: string;
  title?: string;
}) {
  const [activeConfig, setActiveConfig] = useState<DynamicSliderConfig | null>(config || null);
  const [loading, setLoading] = useState(!!blockKey && !config);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (config) setActiveConfig(config);
  }, [config]);

  useEffect(() => {
    if (blockKey && !config) {
      fetch(`/api/shortcode-blocks?key=${encodeURIComponent(blockKey)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.block?.configJson) {
            try {
              setActiveConfig(JSON.parse(data.block.configJson));
            } catch {}
          }
        })
        .finally(() => setLoading(false));
    }
  }, [blockKey, config]);

  if (loading) {
    return <div className="py-6 text-center text-xs font-mono text-stone-400">Đang tải Slide Carousel...</div>;
  }

  // Fallback default slides
  const defaultSlides: SlideItemConfig[] = [
    {
      id: "s1",
      title: "Phạm Nguyễn",
      subtitle: "Bác sĩ Chuyên khoa I",
      description: "Chuyên gia cấy ghép Implant - Hơn 14 năm kinh nghiệm",
      imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
      showCta: true,
      ctaText: "Xem chi tiết →",
      ctaUrl: "tel:0901234567",
    },
    {
      id: "s2",
      title: "Răng Sứ Katana Nhật Bản",
      subtitle: "Bọc Răng Sứ Thẩm Mỹ",
      price: "2.800.000Đ",
      badge: "BÁN CHẠY NHẤT",
      imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
      showCta: true,
      ctaText: "Đặt Lịch Ngay →",
      ctaUrl: "tel:0901234567",
    },
    {
      id: "s3",
      title: "Răng Sứ Cercon HT",
      subtitle: "Bọc Răng Sứ Cao Cấp",
      price: "4.000.000Đ",
      badge: "ƯU ĐÃI 30%",
      imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop",
      showCta: true,
      ctaText: "Đặt Lịch Ngay →",
      ctaUrl: "tel:0901234567",
    },
  ];

  const slides = activeConfig?.slides && activeConfig.slides.length > 0 ? activeConfig.slides : defaultSlides;
  const sliderTitle = title || activeConfig?.title || "CHƯƠNG TRÌNH & ĐỘI NGŨ CHUYÊN GIA";
  const sliderSub = activeConfig?.subtitle || "Đội ngũ giàu kinh nghiệm & trang thiết bị hiện đại hàng đầu";
  const layout = activeConfig?.layout || "CARD_GRID";

  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  const nextSlide = () => setActiveIdx((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    setTimeout(() => setCopiedVoucher(null), 2000);
  };

  // Auto-play interval for Coverflow / Voucher Swiper (every 4 seconds)
  useEffect(() => {
    if (layout === "COVERFLOW" || layout === "VOUCHER_SWIPER") {
      const timer = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % slides.length);
      }, 4500);
      return () => clearInterval(timer);
    }
  }, [layout, slides.length]);

  return (
    <div className="my-8 not-prose font-sans space-y-6">
      {/* Slider Header */}
      {sliderTitle && (
        <div className="text-center space-y-1 my-4">
          <h4 className="text-lg sm:text-xl font-bold font-serif text-stone-900 uppercase tracking-tight">{sliderTitle}</h4>
          {sliderSub && <p className="text-xs text-stone-500">{sliderSub}</p>}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LAYOUT 1: MULTI-CARD GRID CAROUSEL (Team / Doctors / Features) */}
      {/* ------------------------------------------------------------- */}
      {layout === "CARD_GRID" && (
        <div className="space-y-6">
          <div className="relative overflow-visible px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 transition-all duration-500">
              {slides.map((slide, idx) => {
                const isCurrent = idx === activeIdx;
                return (
                  <div
                    key={slide.id || idx}
                    className={`bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#0d4f4a] ${
                      isCurrent ? "ring-2 ring-[#0d4f4a]" : ""
                    }`}
                  >
                    <div className="space-y-4">
                      {slide.imageUrl && (
                        <div className="w-full h-52 rounded-2xl overflow-hidden bg-stone-100 relative">
                          <img src={slide.imageUrl} alt={slide.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          {slide.badge && (
                            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#0d4f4a] text-white text-[9px] font-mono font-bold uppercase shadow-xs">
                              {slide.badge}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="space-y-1 text-center">
                        <h5 className="text-lg font-bold text-stone-900 font-serif">{slide.title}</h5>
                        {slide.subtitle && <p className="text-xs font-semibold text-[#0d4f4a] font-mono">{slide.subtitle}</p>}
                        {slide.description && <p className="text-xs text-stone-500 pt-1 leading-relaxed font-sans">{slide.description}</p>}
                        {slide.price && <div className="text-xl font-black font-mono text-[#0d4f4a] pt-1">{slide.price}</div>}
                      </div>
                    </div>

                    {/* OPTIONAL PER-SLIDE CTA BUTTON */}
                    {slide.showCta !== false && (
                      <div className="pt-4 border-t border-stone-100 mt-4 font-mono">
                        <a
                          href={slide.ctaUrl || "tel:0901234567"}
                          className="w-full py-2.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl block text-center transition-all shadow-xs"
                        >
                          {slide.ctaText || "Xem Chi Tiết →"}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center justify-between mt-4 font-mono">
              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${i === activeIdx ? "w-6 bg-[#0d4f4a]" : "w-2 bg-stone-300"}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={prevSlide} className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextSlide} className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LAYOUT 2 & 4: SWIPER 3D COVERFLOW VOUCHER SLIDER */}
      {/* ------------------------------------------------------------- */}
      {(layout === "COVERFLOW" || layout === "VOUCHER_SWIPER") && (
        <div className="voucher-swiper-section relative py-4 px-2 md:px-6 select-none overflow-visible group">
          <div className="swiper elementor-main-swiper swiper-coverflow swiper-3d swiper-initialized swiper-horizontal swiper-watch-progress w-full max-w-6xl mx-auto relative">
            {/* Hover Floating Navigation Arrows (Far outer left and right edges, centered vertically, hidden by default, visible on hover) */}
            <button
              type="button"
              onClick={prevSlide}
              className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-stone-900/80 hover:bg-[#0d4f4a] text-white backdrop-blur-sm shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 cursor-pointer"
              title="Slide trước"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-stone-900/80 hover:bg-[#0d4f4a] text-white backdrop-blur-sm shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 cursor-pointer"
              title="Slide tiếp theo"
            >
              <ChevronRight size={24} />
            </button>

            {/* 3D Stage Container - Renders 3 visible cards priority (Left, Center/Highlighted, Right) */}
            <div className="swiper-wrapper flex items-center justify-center gap-1 sm:gap-4 md:gap-8 py-6 min-h-[440px] perspective-[1200px]">
              {[
                { position: "LEFT", idx: (activeIdx - 1 + slides.length) % slides.length },
                { position: "CENTER", idx: activeIdx },
                { position: "RIGHT", idx: (activeIdx + 1) % slides.length },
              ].map(({ position, idx }) => {
                const slide = slides[idx];
                if (!slide) return null;

                const isCenter = position === "CENTER";
                const isLeft = position === "LEFT";

                const showImg = slide.showImage ?? activeConfig?.showImage ?? true;
                const showTtl = slide.showTitle ?? activeConfig?.showTitle ?? true;
                const showSub = slide.showSubtitle ?? activeConfig?.showSubtitle ?? true;
                const showDesc = slide.showDescription ?? activeConfig?.showDescription ?? true;
                const showBdg = slide.showBadge ?? activeConfig?.showBadge ?? true;
                const showVCode = slide.showVoucherCode ?? activeConfig?.showVoucherCode ?? true;
                const showBtn = (slide.showCta ?? activeConfig?.showSlideCta ?? true) && slide.showCta !== false;

                const isImageOnly = showImg && !showTtl && !showSub && !showDesc && !showVCode && !showBtn;

                return (
                  <div
                    key={`${slide.id || idx}_${position}`}
                    onClick={() => setActiveIdx(idx)}
                    className={`swiper-slide group transition-all duration-500 cursor-pointer rounded-2xl overflow-hidden shadow-lg isolate flex flex-col justify-between relative w-[250px] sm:w-[270px] md:w-[280px] shrink-0 select-none ${
                      isCenter
                        ? "bg-gradient-to-b from-[#042d2a] via-[#084540] to-[#0d4f4a] text-white shadow-xl"
                        : "bg-white text-stone-800 hover:opacity-95"
                    }`}
                    style={{
                      transform: isCenter
                        ? "scale(1.06) translateZ(45px) rotateY(0deg)"
                        : isLeft
                        ? "scale(0.85) translateZ(-45px) rotateY(16deg)"
                        : "scale(0.85) translateZ(-45px) rotateY(-16deg)",
                      zIndex: isCenter ? 30 : 10,
                      opacity: isCenter ? 1 : 0.82,
                      willChange: "transform",
                    }}
                  >

                    {/* Top Voucher Image & Header Banner */}
                    {showImg && (
                      <div className={`relative w-full overflow-hidden rounded-2xl bg-stone-950 ${isImageOnly ? "h-96 md:h-[440px]" : "h-52 md:h-60"}`}>
                        <img
                          src={slide.imageUrl || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800"}
                          alt={slide.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ borderRadius: "inherit" }}
                        />
                        {!isImageOnly && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />}

                        {/* Voucher Badge */}
                        {showBdg && (slide.badge || slide.price) && (
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-[#00c9b7] text-[#042d2a] font-mono font-bold text-[11px] uppercase tracking-wider rounded-full shadow-md border border-[#00c9b7]/30 z-10">
                            {slide.badge || slide.price}
                          </div>
                        )}

                        {/* Title & Subtitle Overlay on Image Bottom */}
                        {!isImageOnly && (showTtl || showSub) && (
                          <div className="absolute bottom-2.5 left-3 right-3 text-white z-10 font-mono">
                            {showTtl && <h5 className="text-base font-bold font-serif leading-tight drop-shadow-md">{slide.title}</h5>}
                            {showSub && slide.subtitle && <p className="text-[11px] text-[#00c9b7] font-medium truncate">{slide.subtitle}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Perforated Coupon Cutout Dotted Border (chỉ khi có body) */}
                    {!isImageOnly && <div className="w-full border-t-2 border-dashed border-stone-300/40 relative my-0.5" />}

                    {/* Voucher Card Body & Coupon Code */}
                    {!isImageOnly && (
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        {showDesc && slide.description && (
                          <p className={`text-xs leading-relaxed line-clamp-2 font-sans ${isCenter ? "text-teal-100/90" : "text-stone-500"}`}>
                            {slide.description}
                          </p>
                        )}

                        {/* Coupon Code Copy Box */}
                        {showVCode && (
                          <div
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 font-mono text-xs ${
                              isCenter ? "bg-black/30 border-teal-300/40 text-[#00c9b7]" : "bg-stone-50 border-stone-200 text-stone-800"
                            }`}
                          >
                            <div className="truncate">
                              <span className="text-[9px] block opacity-70 font-sans uppercase">Mã Khuyến Mãi:</span>
                              <code className="font-bold text-xs tracking-wider">{slide.voucherCode || `VOUCHER-${idx + 1}`}</code>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyVoucher(slide.voucherCode || `VOUCHER-${idx + 1}`);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer ${
                                isCenter
                                  ? "bg-[#00c9b7] hover:bg-[#00b3a3] text-[#042d2a] shadow-xs"
                                  : "bg-[#0d4f4a] hover:bg-[#083b37] text-white"
                              }`}
                            >
                              {copiedVoucher === (slide.voucherCode || `VOUCHER-${idx + 1}`) ? (
                                <>
                                  <Check size={13} />
                                  <span>Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={13} />
                                  <span>Lấy mã</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* CTA Action Button */}
                        {showBtn && (
                          <a
                            href={slide.ctaUrl || "tel:0901234567"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCtaClick(e, slide.ctaUrl || "tel:0901234567");
                            }}
                            className={`w-full py-2.5 font-mono font-bold text-xs rounded-xl block text-center uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                              isCenter
                                ? "bg-white text-[#0d4f4a] hover:bg-stone-100"
                                : "bg-[#0d4f4a] hover:bg-[#083b37] text-white"
                            }`}
                          >
                            {slide.ctaText || "DÙNG VOUCHER NGAY →"}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Swiper Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-4 font-mono">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  title={`Chuyển tới slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeIdx
                      ? "w-7 bg-[#0d4f4a] shadow-xs"
                      : "w-2.5 bg-stone-300 hover:bg-[#0d4f4a]/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LAYOUT 3: HERO BANNER CAROUSEL */}
      {/* ------------------------------------------------------------- */}
      {layout === "HERO_BANNER" && (
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-stone-900 text-white min-h-[260px] p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4">
            <span className="px-3 py-1 bg-[#0d9488] text-white text-xs font-mono font-bold uppercase rounded-full">
              {slides[activeIdx]?.badge || "ƯU ĐÃI ĐẶC BIỆT"}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={prevSlide} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextSlide} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="my-4 space-y-2 max-w-xl">
            <h4 className="text-2xl md:text-3xl font-extrabold font-serif">{slides[activeIdx]?.title}</h4>
            <p className="text-xs text-stone-300">{slides[activeIdx]?.description}</p>
          </div>

          {slides[activeIdx]?.showCta !== false && (
            <div>
              <a
                href={slides[activeIdx]?.ctaUrl || "tel:0901234567"}
                className="px-6 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md"
              >
                <span>{slides[activeIdx]?.ctaText || "Nhận Ưu Đãi Ngay"}</span>
                <ArrowRight size={14} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* OPTIONAL GLOBAL BOTTOM CTA BUTTON (tích chọn showBottomCta) */}
      {activeConfig?.showBottomCta && (
        <div className="pt-2 text-center">
          <a
            href={activeConfig.bottomCtaUrl || "tel:0901234567"}
            onClick={(e) => handleCtaClick(e, activeConfig.bottomCtaUrl)}
            className="px-8 py-3.5 bg-gradient-to-r from-[#0d9488] to-teal-600 hover:from-[#0f766e] hover:to-teal-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-transform hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            <Gift size={16} />
            <span>{activeConfig.bottomCtaText || "🎁 ĐĂNG KÝ KHÁM & TƯ VẤN MIỄN PHÍ"}</span>
          </a>
        </div>
      )}
    </div>
  );
}

// Static Backwards-compatible components
export function FormDangKyBlock() {
  return <DynamicFormBlock />;
}

export function BangGiaBlock() {
  return <DynamicPricingBlock provider="Lười Dọn Nhà" title="Bảng Giá Dịch Vụ Tham Khảo" />;
}

export function SlideUuDaiBlock() {
  return <PromotionalSliderBlock provider="all" />;
}

export function CamKetBlock() {
  return (
    <div className="my-8 p-6 bg-teal-50/70 border border-teal-200/80 rounded-3xl not-prose font-sans">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200/60 shadow-2xs space-y-1.5">
          <ShieldCheck size={24} className="text-[#0d9488] mx-auto" />
          <h6 className="text-xs font-bold text-stone-900">Bảo Hành 24H</h6>
          <p className="text-[10px] text-stone-500">Dọn lại miễn phí nếu chưa hài lòng</p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200/60 shadow-2xs space-y-1.5">
          <CheckCircle2 size={24} className="text-[#0d9488] mx-auto" />
          <h6 className="text-xs font-bold text-stone-900">Giá Đúng Niêm Yết</h6>
          <p className="text-[10px] text-stone-500">Không phí ẩn, không phụ thu</p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200/60 shadow-2xs space-y-1.5">
          <Sparkles size={24} className="text-[#0d9488] mx-auto" />
          <h6 className="text-xs font-bold text-stone-900">Dụng Cụ Hiện Đại</h6>
          <p className="text-[10px] text-stone-500">Dung dịch sinh học an toàn</p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200/60 shadow-2xs space-y-1.5">
          <PhoneCall size={24} className="text-[#0d9488] mx-auto" />
          <h6 className="text-xs font-bold text-stone-900">Hỗ Trợ 24/7</h6>
          <p className="text-[10px] text-stone-500">Phục vụ kể cả T7, CN & Lễ</p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. INTERACTIVE LUCKY SPIN WHEEL COMPONENT (VÒNG QUAY MAY MẮN)
// -------------------------------------------------------------
export interface LuckySpinItem {
  id: string;
  name: string;
  code: string;
  probability: number;
  color?: string;
}

export interface LuckySpinConfig {
  title?: string;
  subtitle?: string;
  badge?: string;
  maxSpins?: number;
  backgroundImageUrl?: string;
  centerButtonUrl?: string;
  rotationOffset?: number;
  showCouponText?: boolean;
  fontSize?: number;
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;

  // Granular Form Card Customization Fields
  formBadgeText?: string;
  formBadgeColor?: string;
  formTitle?: string;
  formTitleColor?: string;
  formSubtitle?: string;
  formSubtitleColor?: string;
  formBgColor?: string;
  formLabelColor?: string;
  formButtonText?: string;
  formButtonBg?: string;
  formButtonTextColor?: string;
  formFields?: FormFieldConfig[];

  items: LuckySpinItem[];
  formConfig?: DynamicFormConfig;
  customColors?: CustomColorsConfig;
}

export function LuckySpinBlock({
  config,
  blockKey,
}: {
  config?: LuckySpinConfig;
  blockKey?: string;
}) {
  const [activeConfig, setActiveConfig] = useState<LuckySpinConfig | null>(config || null);
  const [loading, setLoading] = useState(!!blockKey && !config);

  const [spinsLeft, setSpinsLeft] = useState<number>(1);
  const [spinning, setSpinning] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [wonItem, setWonItem] = useState<LuckySpinItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Dynamic Form Values State
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setActiveConfig(config);
      setSpinsLeft(config.maxSpins ?? 1);
    }
  }, [config]);

  useEffect(() => {
    if (blockKey && !config) {
      fetch(`/api/shortcode-blocks?key=${encodeURIComponent(blockKey)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.block?.configJson) {
            try {
              const parsed = JSON.parse(data.block.configJson);
              setActiveConfig(parsed);
              setSpinsLeft(parsed.maxSpins ?? 1);
            } catch {}
          }
        })
        .finally(() => setLoading(false));
    }
  }, [blockKey, config]);

  if (loading) {
    return <div className="py-6 text-center text-xs font-mono text-stone-400">Đang tải Vòng Quay May Mắn...</div>;
  }

  // Dynamic Form Fields or Default 3 Fields
  const defaultFormFields: FormFieldConfig[] = [
    { id: "1", label: "Họ và tên *", name: "fullName", type: "text", placeholder: "VD: Nguyễn Văn A", required: true },
    { id: "2", label: "Số điện thoại *", name: "phone", type: "tel", placeholder: "VD: 0901 234 567", required: true },
    { id: "3", label: "Dịch vụ quan tâm", name: "service", type: "select", options: ["Lau dọn nhà cửa định kỳ", "Tổng vệ sinh căn hộ", "Vệ sinh sofa, nệm & thảm"], required: false },
  ];

  const formFields = activeConfig?.formFields?.length ? activeConfig.formFields : defaultFormFields;

  const items = activeConfig?.items?.length
    ? activeConfig.items
    : [
        { id: "1", name: "Voucher Giảm 20%", code: "SPIN20", probability: 25, color: "#0d9488" },
        { id: "2", name: "Tặng Khám Miễn Phí", code: "FREEKHAM", probability: 20, color: "#0284c7" },
        { id: "3", name: "Giảm 50% Tẩy Trắng", code: "SPIN50", probability: 15, color: "#e11d48" },
        { id: "4", name: "Voucher 500K", code: "500KOFF", probability: 20, color: "#f59e0b" },
        { id: "5", name: "Tặng Nón Bảo Hiểm", code: "NONBH", probability: 10, color: "#8b5cf6" },
        { id: "6", name: "Miễn Phí Xe Đưa Đón", code: "XEDON", probability: 10, color: "#16a34a" },
      ];

  const title = activeConfig?.title || "QUAY LÀ TRÚNG - NHẬN ƯU ĐÃI HẤP DẪN";
  const subtitle = activeConfig?.subtitle || "Đăng ký thông tin để nhận thêm 1 lượt quay miễn phí!";
  const maxSpins = activeConfig?.maxSpins ?? 1;
  const showCouponText = activeConfig?.showCouponText !== false;
  const fontSize = activeConfig?.fontSize || 13;
  const textColor = activeConfig?.textColor || "#ffffff";
  const isBold = activeConfig?.isBold !== false;
  const isItalic = activeConfig?.isItalic || false;

  const handleSpin = () => {
    if (spinning || spinsLeft <= 0) return;

    // DYNAMIC FORM FIELD VALIDATION BEFORE SPIN
    for (const field of formFields) {
      if (field.required && !formValues[field.name]?.trim()) {
        setFormError(`⚠️ Vui lòng nhập đầy đủ ${field.label} trước khi bấm quay!`);
        return;
      }
    }
    setFormError(null);

    // Collect Lead Information
    try {
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.fullName || formValues.name || "Khách hàng Vòng Quay",
          phone: formValues.phone || formValues.phoneNumber || "",
          message: `[Vòng Quay May Mắn] Thông tin nhập: ${JSON.stringify(formValues)}`,
        }),
      }).catch(() => {});
    } catch {}

    setSpinning(true);
    setWonItem(null);

    // 1. Calculate Weighted Random Winner Slice Index
    const totalProb = items.reduce((sum, item) => sum + (Number(item.probability) || 10), 0);
    let randomVal = Math.random() * totalProb;
    let winnerIndex = 0;

    for (let i = 0; i < items.length; i++) {
      randomVal -= Number(items[i].probability) || 10;
      if (randomVal <= 0) {
        winnerIndex = i;
        break;
      }
    }

    const numSlices = items.length;
    const sliceAngle = 360 / numSlices;

    // Center of winner slice (0-indexed) measured clockwise from top 12 o'clock
    const winnerSliceCenterAngle = winnerIndex * sliceAngle + sliceAngle / 2;

    // Clockwise rotation to bring winnerSliceCenterAngle to top 12 o'clock pointer needle (0deg)
    const offset = Number(activeConfig?.rotationOffset) || 0;
    let targetAngle = (360 - winnerSliceCenterAngle + offset) % 360;
    if (targetAngle < 0) targetAngle += 360;

    const currentMod = ((rotationDeg % 360) + 360) % 360;
    let delta = (targetAngle - currentMod + 360) % 360;
    if (delta <= 0) {
      delta += 360;
    }

    const nextRotation = rotationDeg + (5 * 360) + delta;

    setRotationDeg(nextRotation);

    // 2. Spin Completion Callback after 5 seconds animation
    setTimeout(() => {
      setSpinning(false);
      setWonItem(items[winnerIndex]);
      setSpinsLeft((prev) => Math.max(0, prev - 1));
    }, 5000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const sliceAngle = 360 / items.length;

  return (
    <div className="my-8 not-prose font-sans">
      <div className="p-6 md:p-8 bg-gradient-to-br from-[#0a3834] via-[#0d4f4a] to-[#0f766e] text-white rounded-3xl shadow-2xl border border-teal-500/30 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Column 1 (5 Cols): Registration Form */}
          <div
            style={{ backgroundColor: activeConfig?.formBgColor || "rgba(255, 255, 255, 0.95)" }}
            className="md:col-span-5 backdrop-blur-md text-stone-900 p-6 rounded-3xl shadow-xl border border-white/40 space-y-4"
          >
            <div className="space-y-1">
              <span
                style={{ color: activeConfig?.formBadgeColor || "#0d9488" }}
                className="text-[10px] font-mono font-bold uppercase tracking-wider block"
              >
                {activeConfig?.formBadgeText || "🎁 ƯU ĐÃI ĐẶC BIỆT"}
              </span>
              <h4
                style={{ color: activeConfig?.formTitleColor || "#1c1917" }}
                className="text-xl font-extrabold font-serif leading-tight"
              >
                {activeConfig?.formTitle || "ĐẶT LỊCH TƯ VẤN MIỄN PHÍ NGAY HÔM NAY!"}
              </h4>
              <p
                style={{ color: activeConfig?.formSubtitleColor || "#78716c" }}
                className="text-xs"
              >
                {activeConfig?.formSubtitle || "Nhập thông tin để nhận thêm 1 lượt quay trúng thưởng 100%."}
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold leading-tight animate-shake">
                {formError}
              </div>
            )}

            <div className="space-y-3 pt-1">
              {/* Dynamic Custom Input Fields Loop */}
              {formFields.map((field) => {
                const isFieldEmpty = !formValues[field.name]?.trim();
                const hasFieldError = formError && field.required && isFieldEmpty;

                return (
                  <div key={field.id} className="space-y-1">
                    <label
                      style={{ color: activeConfig?.formLabelColor || "#44403c" }}
                      className="block text-[11px] font-bold"
                    >
                      {field.label}
                    </label>

                    {field.type === "select" ? (
                      <select
                        value={formValues[field.name] || field.options?.[0] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormValues((prev) => ({ ...prev, [field.name]: val }));
                          if (formError) setFormError(null);
                        }}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#0d9488]"
                      >
                        {field.options?.map((opt, oIdx) => (
                          <option key={oIdx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        rows={2}
                        value={formValues[field.name] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormValues((prev) => ({ ...prev, [field.name]: val }));
                          if (formError) setFormError(null);
                        }}
                        placeholder={field.placeholder || "Nhập thông tin..."}
                        className={`w-full px-3.5 py-2 bg-stone-50 border rounded-xl text-xs focus:outline-none focus:border-[#0d9488] ${
                          hasFieldError ? "border-rose-500 bg-rose-50/30" : "border-stone-300"
                        }`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formValues[field.name] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormValues((prev) => ({ ...prev, [field.name]: val }));
                          if (formError) setFormError(null);
                        }}
                        placeholder={field.placeholder || "Nhập thông tin..."}
                        className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-xs focus:outline-none focus:border-[#0d9488] ${
                          hasFieldError ? "border-rose-500 bg-rose-50/30" : "border-stone-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleSpin}
                disabled={spinning || spinsLeft <= 0}
                style={{
                  background: activeConfig?.formButtonBg || "linear-gradient(to right, #f59e0b, #ea580c, #e11d48)",
                  color: activeConfig?.formButtonTextColor || "#ffffff",
                }}
                className="w-full py-3.5 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>
                  {spinsLeft > 0
                    ? activeConfig?.formButtonText || "ĐĂNG KÝ & QUAY VÒNG QUAY NGAY"
                    : "ĐÃ HẾT LƯỢT QUAY"}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500 font-semibold pt-1">
                <ShieldCheck size={12} className="text-[#0d9488]" />
                <span>Thông tin của bạn được bảo mật tuyệt đối</span>
              </div>
            </div>
          </div>

          {/* Column 2 (7 Cols): Interactive Wheel */}
          <div className="md:col-span-7 flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider border border-amber-400/30 mb-1">
                <Trophy size={13} /> 100% QUAY LÀ TRÚNG QUÀ
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold font-serif text-white tracking-tight">{title}</h3>
              <p className="text-xs md:text-sm text-teal-100/90">{subtitle}</p>
            </div>

            {/* Wheel Outer Frame */}
            <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] md:w-[400px] md:h-[400px] flex items-center justify-center my-2">
              {/* Top Golden Pointer Needle at 12 o'clock (Points DOWN directly at slice center) */}
              <div className="absolute -top-3 z-30 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none drop-shadow-xl">
                <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-400 filter drop-shadow-md" />
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 border border-white shadow-md -mt-7" />
              </div>

              {/* Outer Golden Glowing Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 p-2 shadow-2xl border-4 border-amber-200/60 flex items-center justify-center">
                {/* Wheel Disk (Rotates) */}
                <div
                  style={{
                    transform: `rotate(${rotationDeg}deg)`,
                    transition: spinning ? "transform 5s cubic-bezier(0.15, 0.9, 0.15, 1)" : "none",
                  }}
                  className="w-full h-full rounded-full relative overflow-hidden bg-stone-900 border-4 border-amber-300/80 shadow-inner flex items-center justify-center"
                >
                  {/* Optional Custom Background Image Overlay */}
                  {activeConfig?.backgroundImageUrl && (
                    <img
                      src={activeConfig.backgroundImageUrl}
                      alt="Wheel background"
                      className="absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none opacity-90"
                    />
                  )}

                  {/* SVG Pie Slices */}
                  <svg className="w-full h-full rounded-full" viewBox="0 0 400 400">
                    <g transform="translate(200, 200)">
                      {items.map((item, idx) => {
                        const startAngle = idx * sliceAngle - 90;
                        const endAngle = (idx + 1) * sliceAngle - 90;
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;

                        const x1 = Number((195 * Math.cos(startRad)).toFixed(4));
                        const y1 = Number((195 * Math.sin(startRad)).toFixed(4));
                        const x2 = Number((195 * Math.cos(endRad)).toFixed(4));
                        const y2 = Number((195 * Math.sin(endRad)).toFixed(4));

                        const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                        const pathData = `M 0 0 L ${x1} ${y1} A 195 195 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                        const midAngle = startAngle + sliceAngle / 2;
                        const textRad = (midAngle * Math.PI) / 180;
                        const textX = Number((120 * Math.cos(textRad)).toFixed(4));
                        const textY = Number((120 * Math.sin(textRad)).toFixed(4));

                        const sliceColor =
                          item.color ||
                          ["#0d9488", "#0284c7", "#e11d48", "#f59e0b", "#8b5cf6", "#16a34a"][idx % 6];

                        return (
                          <g key={item.id || idx}>
                            <path d={pathData} fill={sliceColor} stroke="#ffffff" strokeWidth="2.5" />
                            {showCouponText && (
                              <text
                                x={textX}
                                y={textY}
                                fill={textColor}
                                fontSize={fontSize}
                                fontWeight={isBold ? "bold" : "normal"}
                                fontStyle={isItalic ? "italic" : "normal"}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                                className="select-none pointer-events-none font-sans"
                              >
                                {item.name}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
              </div>

              {/* Center Pointer Needle & Spin Button */}
              <div className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                {/* Pointer Needle Arrow pointing UP towards 12 o'clock */}
                <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-amber-400 drop-shadow-md -mb-2" />

                {/* Center Spin Button */}
                <button
                  type="button"
                  onClick={handleSpin}
                  disabled={spinning || spinsLeft <= 0}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-rose-600 via-red-600 to-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl border-4 border-amber-300 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center p-1 cursor-pointer disabled:opacity-80"
                >
                  {activeConfig?.centerButtonUrl ? (
                    <img src={activeConfig.centerButtonUrl} alt="Spin button" className="w-full h-full object-contain rounded-full" />
                  ) : (
                    <>
                      <span>QUAY</span>
                      <span>NGAY</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Spin Turns Counter Footer */}
            <div className="flex items-center gap-2 text-xs font-mono font-bold bg-black/30 px-4 py-1.5 rounded-full border border-white/10 text-amber-300">
              <RotateCw size={14} className={spinning ? "animate-spin text-amber-400" : ""} />
              <span>Số lượt quay còn lại: {spinsLeft} lượt</span>
            </div>
          </div>
        </div>

        {/* CELEBRATION WINNING POPUP MODAL */}
        {wonItem && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white text-stone-900 p-6 md:p-8 rounded-3xl max-w-md w-full text-center space-y-5 shadow-2xl border border-amber-300 relative">
              <button
                type="button"
                onClick={() => setWonItem(null)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                ✕
              </button>

              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <Trophy size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-extrabold uppercase text-[#0d9488] tracking-widest block">
                  🎉 CHÚC MỪNG BẠN ĐÃ TRÚNG THƯỞNG!
                </span>
                <h3 className="text-2xl font-black font-serif text-stone-900">{wonItem.name}</h3>
                <p className="text-xs text-stone-500">Mã ưu đãi đặc biệt dành riêng cho bạn khi đăng ký hôm nay:</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 flex items-center justify-between gap-2">
                <code className="font-mono text-lg font-bold text-amber-900 tracking-wider">{wonItem.code}</code>
                <button
                  type="button"
                  onClick={() => handleCopyCode(wonItem.code)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? "Đã chép" : "Sao chép"}</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setWonItem(null)}
                  className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider"
                >
                  NHẬN ƯU ĐÃI NGAY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. VISUAL DRAG & DROP CUSTOM CANVAS BLOCK COMPONENT
// -------------------------------------------------------------
export interface CustomCanvasElement {
  id: string;
  type: "HEADING" | "TEXT" | "IMAGE" | "BUTTON" | "BADGE" | "VIDEO" | "CARD_GRID";
  content?: string;
  subtitle?: string;
  url?: string;
  align?: "left" | "center" | "right";
  fontSize?: number;
  fontWeight?: "normal" | "bold" | "extrabold";
  color?: string;
  bgColor?: string;
  borderColor?: string;
  borderRadius?: number;
  width?: string;
  icon?: string;
  items?: Array<{ id: string; title: string; desc: string; icon?: string; color?: string }>;
}

export interface CustomCanvasConfig {
  title?: string;
  layout?: "1_COL" | "2_COL_EQUAL" | "2_COL_SPLIT" | "3_COL" | "4_COL";
  bgColor?: string;
  bgImageUrl?: string;
  bgOverlayOpacity?: number;
  paddingY?: number;
  borderRadius?: number;
  customColors?: CustomColorsConfig;
  elements: CustomCanvasElement[];
}

// -------------------------------------------------------------
// SMART VIDEO EMBED PARSER (YOUTUBE, TIKTOK, FACEBOOK REELS, MP4)
// -------------------------------------------------------------
export function formatVideoEmbedUrl(rawUrl?: string): {
  embedUrl: string;
  type: "youtube" | "tiktok" | "facebook" | "mp4" | "iframe";
  videoId?: string;
  thumbnailUrl?: string;
} {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
      type: "youtube",
      videoId: "dQw4w9WgXcQ",
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    };
  }

  const url = rawUrl.trim();

  // 1. YouTube links (watch?v=, youtu.be/, shorts/, embed/)
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0] || "";
    } else if (url.includes("shorts/")) {
      videoId = url.split("shorts/")[1]?.split("?")[0]?.split("&")[0] || "";
    } else if (url.includes("watch")) {
      const match = url.match(/[?&]v=([^&]+)/);
      if (match) videoId = match[1];
    } else if (url.includes("embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0]?.split("&")[0] || "";
    }

    if (videoId) {
      return {
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`,
        type: "youtube",
        videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    }
  }

  // 2. TikTok links (@user/video/12345)
  if (url.includes("tiktok.com")) {
    let videoId = "";
    if (url.includes("/video/")) {
      videoId = url.split("/video/")[1]?.split("?")[0]?.split("/")[0] || "";
    } else if (url.includes("/v/")) {
      videoId = url.split("/v/")[1]?.split("?")[0]?.split(".html")[0] || "";
    }

    if (videoId) {
      return {
        embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
        type: "tiktok",
        videoId,
      };
    }
  }

  // 3. Facebook / Reels / Watch links
  if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("fb.com")) {
    const encoded = encodeURIComponent(url);
    return {
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&autoplay=true`,
      type: "facebook",
    };
  }

  // 4. Direct video file (.mp4, .webm, .ogg)
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return { embedUrl: url, type: "mp4" };
  }

  return { embedUrl: url, type: "iframe" };
}

export function SmartVideoPlayer({ url, title, alignClass }: { url?: string; title?: string; alignClass?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { embedUrl, type: videoType, videoId, thumbnailUrl } = formatVideoEmbedUrl(url);

  const [imgSrc, setImgSrc] = useState(
    thumbnailUrl ||
      (videoType === "youtube" && videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800")
  );

  useEffect(() => {
    if (thumbnailUrl) {
      setImgSrc(thumbnailUrl);
    } else if (videoType === "youtube" && videoId) {
      setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    }
  }, [thumbnailUrl, videoId, videoType]);

  return (
    <div className={`w-full ${alignClass || ""}`}>
      <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border border-stone-200 bg-black relative group">
        {!isPlaying ? (
          <div
            onClick={() => setIsPlaying(true)}
            className="w-full h-full relative flex items-center justify-center bg-stone-900 group cursor-pointer"
          >
            {/* Clean Cover Thumbnail Image */}
            <img
              src={imgSrc}
              alt={title || "Video Cover Thumbnail"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => {
                if (videoId && imgSrc.includes("maxresdefault")) {
                  setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
                }
              }}
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

            {/* Centered YouTube-Style Red Play Button */}
            <div className="absolute z-10 transition-transform duration-300 group-hover:scale-110">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#ff0000] hover:bg-[#cc0000] text-white flex items-center justify-center shadow-2xl border-2 border-white/50">
                <Play size={36} className="ml-1 fill-white text-white" />
              </div>
            </div>
          </div>
        ) : (
          /* Active Playing State */
          videoType === "mp4" ? (
            <video src={embedUrl} controls autoPlay className="w-full h-full object-cover" />
          ) : (
            <iframe
              src={embedUrl}
              title={title || "Video Player"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )
        )}
      </div>
    </div>
  );
}

export function CustomCanvasBlock({
  config,
  blockKey,
}: {
  config?: CustomCanvasConfig;
  blockKey?: string;
}) {
  const [activeConfig, setActiveConfig] = useState<CustomCanvasConfig | null>(config || null);
  const [loading, setLoading] = useState(!!blockKey && !config);

  useEffect(() => {
    if (config) setActiveConfig(config);
  }, [config]);

  useEffect(() => {
    if (blockKey && !config) {
      fetch(`/api/shortcode-blocks?key=${encodeURIComponent(blockKey)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.block?.configJson) {
            try {
              setActiveConfig(JSON.parse(data.block.configJson));
            } catch {}
          }
        })
        .finally(() => setLoading(false));
    }
  }, [blockKey, config]);

  if (loading) {
    return <div className="py-6 text-center text-xs font-mono text-stone-400">Đang tải Custom Canvas Block...</div>;
  }

  const elements = activeConfig?.elements?.length ? activeConfig.elements : [];
  const layout = activeConfig?.layout || "1_COL";

  const getLayoutClass = () => {
    switch (layout) {
      case "2_COL_EQUAL":
        return "grid grid-cols-1 md:grid-cols-2 gap-6 items-center";
      case "2_COL_SPLIT":
        return "grid grid-cols-1 md:grid-cols-12 gap-6 items-center";
      case "3_COL":
        return "grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch";
      case "4_COL":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch";
      default:
        return "flex flex-col space-y-4";
    }
  };

  return (
    <div className="my-8 not-prose font-sans">
      <div
        style={{
          backgroundColor: activeConfig?.bgColor || "transparent",
          backgroundImage: activeConfig?.bgImageUrl ? `url(${activeConfig.bgImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: `${activeConfig?.paddingY ?? 32}px`,
          paddingBottom: `${activeConfig?.paddingY ?? 32}px`,
          borderRadius: `${activeConfig?.borderRadius ?? 24}px`,
        }}
        className="relative p-6 md:p-8 overflow-hidden shadow-lg border border-stone-200/50"
      >
        {activeConfig?.bgImageUrl && activeConfig?.bgOverlayOpacity && (
          <div
            style={{ backgroundColor: `rgba(0,0,0,${activeConfig.bgOverlayOpacity})` }}
            className="absolute inset-0 pointer-events-none"
          />
        )}

        <div className={`relative z-10 ${getLayoutClass()}`}>
          {elements.map((el) => {
            const alignClass =
              el.align === "center"
                ? "text-center justify-center mx-auto"
                : el.align === "right"
                ? "text-right justify-end ml-auto"
                : "text-left justify-start";

            switch (el.type) {
              case "HEADING":
                return (
                  <h3
                    key={el.id}
                    style={{ color: el.color || undefined, fontSize: el.fontSize ? `${el.fontSize}px` : undefined }}
                    className={`font-extrabold font-serif leading-tight ${alignClass}`}
                  >
                    {el.content || "Tiêu đề Canvas"}
                  </h3>
                );

              case "TEXT":
                return (
                  <p
                    key={el.id}
                    style={{ color: el.color || undefined, fontSize: el.fontSize ? `${el.fontSize}px` : undefined }}
                    className={`text-sm leading-relaxed ${alignClass}`}
                  >
                    {el.content || "Đoạn văn miêu tả nội dung linh hoạt..."}
                  </p>
                );

              case "BADGE":
                return (
                  <div key={el.id} className={`flex ${alignClass}`}>
                    <span
                      style={{
                        backgroundColor: el.bgColor || "#0d9488",
                        color: el.color || "#ffffff",
                        fontSize: el.fontSize ? `${el.fontSize}px` : "11px",
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm"
                    >
                      <Sparkles size={12} />
                      {el.content || "BADGE NỔI BẬT"}
                    </span>
                  </div>
                );

              case "IMAGE":
                return (
                  <div key={el.id} className={`flex flex-col items-center ${alignClass}`}>
                    <img
                      src={el.url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800"}
                      alt={el.content || "Canvas Image"}
                      style={{ borderRadius: `${el.borderRadius ?? 16}px`, width: el.width || "100%" }}
                      className="object-cover shadow-md transition-transform hover:scale-[1.01]"
                    />
                    {el.content && <span className="text-xs text-stone-500 mt-1 font-medium">{el.content}</span>}
                  </div>
                );

              case "BUTTON":
                return (
                  <div key={el.id} className={`flex ${alignClass}`}>
                    <a
                      href={el.url || "#"}
                      style={{
                        backgroundColor: el.bgColor || "#0d9488",
                        color: el.color || "#ffffff",
                        borderColor: el.borderColor || undefined,
                        fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
                      }}
                      className="px-6 py-3 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform hover:-translate-y-0.5 inline-flex items-center gap-2"
                    >
                      <ArrowRight size={16} />
                      <span>{el.content || "Bấm Xem Chi Tiết"}</span>
                    </a>
                  </div>
                );

              case "VIDEO": {
                return (
                  <div key={el.id} className="w-full">
                    <SmartVideoPlayer url={el.url} title={el.content} alignClass={alignClass} />
                  </div>
                );
              }

              case "CARD_GRID":
                return (
                  <div key={el.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                    {el.items?.map((item) => (
                      <div
                        key={item.id}
                        style={{ backgroundColor: item.color || "#ffffff" }}
                        className="p-4 rounded-2xl border border-stone-200 shadow-sm space-y-1"
                      >
                        <div className="font-bold text-stone-900 text-sm">{item.title}</div>
                        <div className="text-xs text-stone-500">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 8. SMART AUTO BLOCK LOADER (AUTO ROUTE BY DB BLOCK TYPE)
// -------------------------------------------------------------
const blockCacheMap = new Map<string, { type: string; config: any }>();

export function AutoBlockLoader({
  blockKey,
  type,
  provider,
  title,
}: {
  blockKey?: string;
  type?: string;
  provider?: string;
  title?: string;
}) {
  const [blockType, setBlockType] = useState<string | null>(() =>
    blockKey && blockCacheMap.has(blockKey) ? blockCacheMap.get(blockKey)!.type : type || null
  );
  const [configData, setConfigData] = useState<any>(() =>
    blockKey && blockCacheMap.has(blockKey) ? blockCacheMap.get(blockKey)!.config : null
  );
  const [loading, setLoading] = useState(() => (blockKey ? !blockCacheMap.has(blockKey) : false));

  useEffect(() => {
    if (blockKey) {
      if (blockCacheMap.has(blockKey)) {
        const cached = blockCacheMap.get(blockKey)!;
        setBlockType(cached.type);
        setConfigData(cached.config);
        setLoading(false);
        return;
      }

      fetch(`/api/shortcode-blocks?key=${encodeURIComponent(blockKey)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.block) {
            let parsed = null;
            try {
              parsed = JSON.parse(data.block.configJson);
            } catch {}
            blockCacheMap.set(blockKey, { type: data.block.type, config: parsed });
            setBlockType(data.block.type);
            setConfigData(parsed);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [blockKey]);

  if (loading) {
    return <div className="py-6 text-center text-xs font-mono text-stone-400">Đang tải Shortcode Block...</div>;
  }

  const effectiveType = (blockType || type || "").toUpperCase();

  if (effectiveType === "CUSTOM_CANVAS" || blockKey?.includes("canvas") || blockKey?.includes("custom-block")) {
    return <CustomCanvasBlock config={configData} blockKey={blockKey} />;
  }
  if (effectiveType === "LUCKY_SPIN" || blockKey?.includes("vong-quay") || blockKey?.includes("lucky-spin")) {
    return <LuckySpinBlock config={configData} blockKey={blockKey} />;
  }
  if (effectiveType === "FORM") {
    return <DynamicFormBlock config={configData} blockKey={blockKey} />;
  }
  if (effectiveType === "BANNER") {
    return <StandaloneBannerBlock config={configData} blockKey={blockKey} />;
  }
  if (effectiveType === "BUTTON") {
    return <StandaloneButtonBlock config={configData} blockKey={blockKey} />;
  }
  if (effectiveType === "SLIDER") {
    return <PromotionalSliderBlock config={configData} blockKey={blockKey} provider={provider} />;
  }
  if (effectiveType === "VOUCHER" || blockKey?.includes("voucher") || blockKey?.includes("uu-dai")) {
    return (
      <PromotionalSliderBlock
        config={configData ? { ...configData, layout: configData.layout || "VOUCHER_SWIPER" } : ({ layout: "VOUCHER_SWIPER" } as any)}
        blockKey={blockKey}
        provider={provider}
      />
    );
  }

  return <DynamicPricingBlock config={configData} blockKey={blockKey} provider={provider} title={title} />;
}

// -------------------------------------------------------------
// 8. MAIN SHORTCODE PARSER ROUTER
// -------------------------------------------------------------
export default function ShortcodeContentParser({ html }: { html: string }) {
  const elements = React.useMemo(() => {
    if (!html) return null;

    const shortcodeTagRegex = /(\[[a-zA-Z0-9_-]+(?:\s+[^\]]+)?\])/g;
    const parts = html.split(shortcodeTagRegex);

    return parts.map((part, index) => {
      const parsed = parseShortcodeString(part);

      if (parsed) {
        const { tagName, attrs } = parsed;

        // Generic Dynamic Block by Key: [block key="..."]
        if (["block", "shortcode", "custom-block"].includes(tagName) || attrs.key) {
          const key = attrs.key || attrs.id;
          return <AutoBlockLoader key={index} blockKey={key} type={attrs.type} provider={attrs.provider} title={attrs.title} />;
        }

        // 1. Interactive Lucky Spin Wheel: [vong-quay], [lucky-spin], [spin]
        if (["vong-quay", "lucky-spin", "spin"].includes(tagName)) {
          return <LuckySpinBlock key={index} blockKey={attrs.key} />;
        }

        // 2. Standalone CTA Banner: [banner], [cta-banner]
        if (["banner", "cta-banner"].includes(tagName)) {
          return <StandaloneBannerBlock key={index} blockKey={attrs.key} />;
        }

        // 3. Standalone CTA Button: [button], [cta-button], [cta]
        if (["button", "cta-button", "cta"].includes(tagName)) {
          return <StandaloneButtonBlock key={index} blockKey={attrs.key} />;
        }

        // 4. Offer / Voucher Block: [uu-dai], [offer-nhacungcap]
        if (["uu-dai", "offer-nhacungcap", "vouchers"].includes(tagName)) {
          return (
            <ProviderOffersBlock
              key={index}
              provider={attrs.provider || attrs.merchant || "shopee"}
              title={attrs.title}
              limit={attrs.limit}
            />
          );
        }

        // 5. Pricing Comparison Table: [bang-gia-nhacungcap], [bang-gia-provider], [bang-gia-dich-vu], [pricing-table], [bang-gia]
        if (["bang-gia-nhacungcap", "bang-gia-provider", "bang-gia-dich-vu", "pricing-table", "bang-gia"].includes(tagName)) {
          return (
            <DynamicPricingBlock
              key={index}
              blockKey={attrs.key}
              provider={attrs.provider || attrs.merchant || "Lười Dọn Nhà"}
              title={attrs.title}
            />
          );
        }

        // 6. Carousel / Slider Banner: [slide-khuyen-mai], [slide-carousel], [slide-uu-dai], [slide]
        if (["slide-khuyen-mai", "slide-carousel", "slide-uu-dai", "slide"].includes(tagName)) {
          return <PromotionalSliderBlock key={index} blockKey={attrs.key} provider={attrs.provider || "all"} title={attrs.title} />;
        }

        // 7. Form Lead Block: [form-dang-ky], [form-contact], [form]
        if (["form-dang-ky", "form-contact", "form"].includes(tagName)) {
          return <DynamicFormBlock key={index} blockKey={attrs.key} />;
        }

        // 8. Trust Badges Block: [cam-ket-chat-luong], [trust-badges]
        if (["cam-ket-chat-luong", "trust-badges"].includes(tagName)) {
          return <CamKetBlock key={index} />;
        }

        // 9. AFP Partner Embed: [nhung-doi-tac]
        if (["nhung-doi-tac", "doi-tac", "partner-widget"].includes(tagName)) {
          const src = attrs.src || "https://qini-home.afp.ad";
          const height = attrs.height || "620";
          return (
            <div key={index} className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden my-6">
              <div className="border-b border-stone-100 px-4 py-2.5 flex items-center gap-2 bg-stone-50">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs font-semibold text-stone-600">Công cụ tiện ích</span>
              </div>
              <iframe
                src={src}
                title="Partner Tool Widget"
                className="w-full border-0"
                style={{ height: `${height}px`, border: "none" }}
                scrolling="no"
                allow="clipboard-read; clipboard-write"
              />
            </div>
          );
        }

        // 10. Video Reels / Shorts Block: [video-reels url="..." title="..." views="10K"]
        if (["video-reels", "reel", "shorts", "video"].includes(tagName)) {
          const videoUrl = attrs.url || attrs.src || attrs.href || "";
          const videoTitle = attrs.title || "Video hướng dẫn";
          const videoViews = attrs.views || "";
          const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
          let embedUrl = videoUrl;
          if (isYouTube) {
            const ytId = videoUrl.split("/").pop()?.split("?")[0] || "";
            embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1`;
          }
          return (
            <div key={index} className="relative w-full max-w-sm mx-auto my-6 rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-stone-200">
              {videoUrl ? (
                <iframe
                  src={embedUrl}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full border-0"
                  style={{ aspectRatio: "9/16", border: "none" }}
                />
              ) : (
                <div className="aspect-[9/16] flex flex-col items-center justify-center text-white text-center p-6 space-y-3">
                  <Play size={40} className="text-teal-400" />
                  <p className="text-sm font-bold">{videoTitle}</p>
                  <code className="text-xs text-slate-400 font-mono">Thiếu thuộc tính url=&quot;...&quot; trong shortcode</code>
                </div>
              )}
              {(videoTitle || videoViews) && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs font-bold line-clamp-2">{videoTitle}</p>
                  {videoViews && <span className="text-slate-300 text-[10px]">👁 {videoViews} lượt xem</span>}
                </div>
              )}
            </div>
          );
        }
      }

      // Render raw HTML cleanly
      return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  }, [html]);

  if (!html) return null;
  return <>{elements}</>;
}
