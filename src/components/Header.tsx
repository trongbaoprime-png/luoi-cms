"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneCall, X, CheckCircle2, Sparkles, Send, Code2 } from "lucide-react";
import ShortcodeContentParser from "./ShortcodeContentParser";
import SmartPhoneInput from "./SmartPhoneInput";

interface MenuItem {
  id: string;
  title: string;
  url: string;
}

export interface HeaderCtaButtonConfig {
  id: string;
  enabled: boolean;
  text: string;
  actionType: "URL" | "CALL" | "POPUP_FORM" | "SHORTCODE";
  url?: string;
  phone?: string;
  shortcodeTag?: string; // e.g. [block key="form-header"]
  formBlockKey?: string; // e.g. form-header, form-popup, form-khuyenmai
  popupTitle?: string;
  popupSubtitle?: string;
  popupSuccessTitle?: string;
  popupSuccessMsg?: string;
  popupSuccessBtnText?: string;
  bgColor?: string;
  textColor?: string;
  targetBlank?: boolean;
}

interface HeaderSettingsState {
  menuItems: MenuItem[];
  siteName: string;
  logoUrl: string;
  logoPosDesktop: "left" | "center" | "right";
  logoPosMobile: "left" | "center" | "right";
  menuPosDesktop: "left" | "center" | "right";
  menuStyle: "pill" | "underline";
  logoHeightDesktop: number;
  logoHeightMobile: number;
  ctaButtons: HeaderCtaButtonConfig[];
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "1", title: "Trang chủ", url: "/" },
  { id: "17855525305930.4367543888924821", title: "Đi Chợ & Mua Sắm", url: "/di-cho" },
  { id: "17855525305930.3103392513051577", title: "Mua sắm", url: "/mua-sam" },
];

const DEFAULT_SETTINGS: HeaderSettingsState = {
  menuItems: DEFAULT_MENU_ITEMS,
  siteName: "LƯỜI DỌN NHÀ",
  logoUrl: "",
  logoPosDesktop: "left",
  logoPosMobile: "left",
  menuPosDesktop: "right",
  menuStyle: "pill",
  logoHeightDesktop: 40,
  logoHeightMobile: 32,
  ctaButtons: [],
};

export default function Header() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<HeaderSettingsState>(DEFAULT_SETTINGS);

  // Popup Form Modal Control States
  const [activePopupBtn, setActivePopupBtn] = useState<HeaderCtaButtonConfig | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", branch: "", note: "" });
  const [verifiedAntiSpam, setVerifiedAntiSpam] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Global listener for open-cta-popup events triggered by CTA buttons in shortcode blocks
  useEffect(() => {
    const handleOpenPopupEvent = (e: Event) => {
      const customEvt = e as CustomEvent;
      const key = customEvt.detail?.formBlockKey || "form-header";
      setActivePopupBtn({
        id: "global-cta-popup",
        enabled: true,
        text: "Đăng Ký Tư Vấn",
        actionType: "POPUP_FORM",
        formBlockKey: key,
      });
      setFormSubmitted(false);
    };

    window.addEventListener("open-cta-popup", handleOpenPopupEvent);
    return () => window.removeEventListener("open-cta-popup", handleOpenPopupEvent);
  }, []);

  useEffect(() => {
    const CACHE_KEY = "luoi_header_settings_v4";
    const CACHE_TTL_MS = 10 * 60 * 1000; // 10 phút

    // Clean legacy cache keys if present to avoid stale menu shifts
    try {
      localStorage.removeItem("luoi_header_settings_v2");
      localStorage.removeItem("luoi_header_settings_v3");
      sessionStorage.removeItem("luoi_header_settings_v2");
      sessionStorage.removeItem("luoi_header_settings_v3");
    } catch {}

    function parseAndApplySettings(d: Record<string, string>) {
      let menuItems = DEFAULT_MENU_ITEMS;
      if (d.header_menu) {
        try {
          const parsed = JSON.parse(d.header_menu);
          if (Array.isArray(parsed) && parsed.length > 0) menuItems = parsed;
        } catch {}
      }

      let ctaButtons: HeaderCtaButtonConfig[] = [];
      if (d.header_cta_buttons) {
        try {
          const parsedButtons = JSON.parse(d.header_cta_buttons);
          if (Array.isArray(parsedButtons)) ctaButtons = parsedButtons;
        } catch {}
      } else if (d.header_cta_text) {
        ctaButtons = [
          {
            id: "cta-1",
            enabled: d.header_cta_enabled !== "false",
            text: d.header_cta_text || "Săn Deal Hot →",
            actionType: (d.header_cta_action_type as any) || "URL",
            url: d.header_cta_url || "/home#deals",
            phone: d.header_cta_phone || "",
            popupTitle: d.header_cta_popup_title || "Đăng Ký Tư Vấn",
            popupSubtitle: d.header_cta_popup_subtitle || "Để lại thông tin...",
            bgColor: d.header_cta_bg_color || "#0d4f4a",
            textColor: d.header_cta_text_color || "#ffffff",
            targetBlank: d.header_cta_target_blank === "true",
          },
        ];
      }

      // Single BATCHED state update to prevent multi-frame layout jittering
      setSettings({
        menuItems,
        siteName: d.site_name || "LƯỜI DỌN NHÀ",
        logoUrl: d.logo_url || "",
        logoPosDesktop: (d.logo_pos_desktop as any) || "left",
        logoPosMobile: (d.logo_pos_mobile as any) || "left",
        menuPosDesktop: (d.menu_pos_desktop as any) || "right",
        menuStyle: (d.menu_style as any) || "pill",
        logoHeightDesktop: Number(d.logo_height_desktop) || 40,
        logoHeightMobile: Number(d.logo_height_mobile) || 32,
        ctaButtons,
      });
    }

    // 1. Apply local cache immediately
    try {
      const cached = localStorage.getItem(CACHE_KEY) || sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ts, data } = JSON.parse(cached);
        if (data) {
          parseAndApplySettings(data);
          if (Date.now() - ts < CACHE_TTL_MS) return; // cache is fresh
        }
      }
    } catch {}

    // 2. Background revalidation from API
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          parseAndApplySettings(res.data);
          try {
            const payload = JSON.stringify({ ts: Date.now(), data: res.data });
            localStorage.setItem(CACHE_KEY, payload);
            sessionStorage.setItem(CACHE_KEY, payload);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const {
    menuItems,
    siteName,
    logoUrl,
    logoPosDesktop,
    logoPosMobile,
    menuPosDesktop,
    menuStyle,
    logoHeightDesktop,
    logoHeightMobile,
    ctaButtons,
  } = settings;

  // Compute Alignment CSS Classes for Desktop & Mobile
  const getNavFlexClasses = () => {
    let desktopJustify = "md:justify-between";
    if (logoPosDesktop === "center") desktopJustify = "md:justify-around";
    if (logoPosDesktop === "right") desktopJustify = "md:flex-row-reverse md:justify-between";

    let mobileJustify = "justify-between";
    if (logoPosMobile === "center") mobileJustify = "justify-center";
    if (logoPosMobile === "right") mobileJustify = "flex-row-reverse justify-between";

    return `${mobileJustify} ${desktopJustify}`;
  };



  const handleSubmitPopupForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedAntiSpam) {
      alert("Vui lòng tích vào ô 'Xác minh chống Spam' trước khi gửi đăng ký!");
      return;
    }
    setFormSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          note: `[Chi nhánh: ${formData.branch || "Chưa chọn"}] ${formData.note || "Đăng ký từ Nút CTA Header Website"}`,
          source: "HEADER_POPUP_FORM",
        }),
      });
      setFormSubmitted(true);
    } catch {
      setFormSubmitted(true);
    } finally {
      setFormSubmitting(false);
    }
  };

  const activeButtons = ctaButtons.filter((b) => b.enabled);

  return (
    <>
      <header className="sticky top-0 z-50 w-full min-h-[64px] border-b border-stone-200/80 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out">
        <nav className={`mx-auto flex max-w-[1280px] items-center px-6 py-[14px] ${getNavFlexClasses()}`}>
          {/* Dynamic Logo Link */}
          <Link aria-label={`${siteName} trang chủ`} className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-90" href="/">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                style={{
                  height: `${logoHeightMobile}px`,
                }}
                className="object-contain md:hidden transition-all"
              />
            ) : null}

            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                style={{ height: `${logoHeightDesktop}px` }}
                className="object-contain hidden md:block transition-all"
              />
            ) : (
              <>
                <span className="w-8 h-8 rounded-xl bg-[#0d4f4a] text-white flex items-center justify-center font-mono font-black text-sm shadow-xs">
                  L
                </span>
                <span className="font-mono font-bold text-base text-stone-900 tracking-tight uppercase">
                  {siteName}
                </span>
              </>
            )}
          </Link>

          {/* Dynamic Header Navigation Items */}
          <div className={`hidden md:flex ${logoPosDesktop === "center" ? "flex-none" : "flex-1 px-8"} ${
            menuPosDesktop === "left" ? "justify-start" :
            menuPosDesktop === "center" ? "justify-center" :
            "justify-end"
          }`}>
            <div className="flex items-center gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && (pathname?.startsWith(item.url) ?? false));
                return (
                  <Link
                    key={item.id}
                    className={`relative px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 ease-in-out ${
                      isActive
                        ? menuStyle === "underline"
                          ? "text-[#0d4f4a] font-black border-b-2 border-[#0d4f4a] bg-transparent rounded-none"
                          : "text-[#0d4f4a] bg-[#0d4f4a]/10 font-black rounded-xl shadow-2xs"
                        : "text-stone-700 hover:text-[#0d4f4a] hover:bg-stone-100/80 rounded-xl"
                    }`}
                    href={item.url}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* USER REQUIREMENT: MULTIPLE DYNAMIC HEADER CTA BUTTONS */}
          {activeButtons.length > 0 && (
            <div className="flex items-center gap-2.5">
              {activeButtons.map((btn) => (
                <div key={btn.id}>
                  {/* ACTION TYPE 1: OPEN URL */}
                  {btn.actionType === "URL" && (
                    <Link
                      style={{ backgroundColor: btn.bgColor || "#0d4f4a", color: btn.textColor || "#ffffff" }}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5 shadow-sm"
                      href={btn.url || "/"}
                      target={btn.targetBlank ? "_blank" : undefined}
                    >
                      <span>{btn.text}</span>
                    </Link>
                  )}

                  {/* ACTION TYPE 2: DIRECT PHONE CALL */}
                  {btn.actionType === "CALL" && (
                    <a
                      style={{ backgroundColor: btn.bgColor || "#0d4f4a", color: btn.textColor || "#ffffff" }}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5 shadow-sm cta-pulse"
                      href={`tel:${btn.phone || ""}`}
                    >
                      <PhoneCall size={13} />
                      <span>{btn.text}</span>
                    </a>
                  )}

                  {/* ACTION TYPE 3 & 4: POPUP MODAL FORM & SHORTCODE MODAL */}
                  {(btn.actionType === "POPUP_FORM" || btn.actionType === "SHORTCODE") && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePopupBtn(btn);
                        setFormSubmitted(false);
                      }}
                      style={{ backgroundColor: btn.bgColor || "#0d4f4a", color: btn.textColor || "#ffffff" }}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5 shadow-sm cursor-pointer"
                    >
                      {btn.actionType === "SHORTCODE" ? <Code2 size={13} /> : <Sparkles size={13} />}
                      <span>{btn.text}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </nav>
      </header>

      {/* POPUP MODAL OVERLAY (HANDLES BUILT-IN FORM & SHORTCODE EMBEDDING) */}
      {activePopupBtn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs font-sans text-stone-900 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActivePopupBtn(null)}
              className="absolute top-4 right-4 z-10 p-1.5 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* RENDER SELECTED SAVED FORM BLOCK OR SHORTCODE CONTENT */}
            {activePopupBtn.actionType === "SHORTCODE" || activePopupBtn.formBlockKey ? (
              <div className="pt-2">
                <ShortcodeContentParser
                  html={
                    activePopupBtn.shortcodeTag?.startsWith("[")
                      ? activePopupBtn.shortcodeTag
                      : `[block key="${activePopupBtn.formBlockKey || activePopupBtn.shortcodeTag || "form-header"}"]`
                  }
                />
              </div>
            ) : formSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold font-serif text-stone-900">
                  {activePopupBtn?.popupSuccessTitle || "Gửi Thông Tin Thành Công!"}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                  {activePopupBtn?.popupSuccessMsg || "Cảm ơn bạn! Chuyên viên tư vấn sẽ liên hệ lại với số điện thoại của bạn trong ít phút."}
                </p>
                <button
                  type="button"
                  onClick={() => setActivePopupBtn(null)}
                  style={{
                    backgroundColor: activePopupBtn?.bgColor || "#0d4f4a",
                    color: activePopupBtn?.textColor || "#ffffff",
                  }}
                  className="px-6 py-2.5 font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-xs cursor-pointer"
                >
                  {activePopupBtn?.popupSuccessBtnText || "Hoàn Tất & Đóng Khung"}
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#0d4f4a]" />
                    <span>{activePopupBtn.popupTitle || "Đăng Ký Tư Vấn & Nhận Ưu Đãi"}</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    {activePopupBtn.popupSubtitle || "Để lại thông tin, chuyên viên sẽ gọi điện tư vấn trực tiếp sau 5 phút!"}
                  </p>
                </div>

                <form onSubmit={handleSubmitPopupForm} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Họ và Tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0d4f4a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Số Điện Thoại <span className="text-rose-500">*</span>
                    </label>
                    <SmartPhoneInput
                      value={formData.phone}
                      onChange={(val) => setFormData({ ...formData, phone: val })}
                      required
                      placeholder="VD: 0912 743 327"
                      inputStyleClass="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 bg-white focus:ring-2 focus:ring-[#0d4f4a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Chi Nhánh Gần Bạn</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0d4f4a] focus:outline-none bg-white text-stone-900"
                    >
                      <option value="">-- Chọn Chi Nhánh Gần Bạn --</option>
                      <option value="Chi nhánh TP. Hồ Chí Minh">Chi nhánh TP. Hồ Chí Minh</option>
                      <option value="Chi nhánh Hà Nội">Chi nhánh Hà Nội</option>
                      <option value="Chi nhánh Đà Nẵng">Chi nhánh Đà Nẵng</option>
                      <option value="Chi nhánh Cần Thơ">Chi nhánh Cần Thơ</option>
                      <option value="Chi nhánh Bình Dương">Chi nhánh Bình Dương</option>
                      <option value="Chi nhánh Đồng Nai">Chi nhánh Đồng Nai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Nhu cầu tư vấn / Ghi chú</label>
                    <textarea
                      rows={2}
                      placeholder="Nội dung dịch vụ hoặc thắc mắc cần hỗ trợ..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-medium resize-none focus:ring-2 focus:ring-[#0d4f4a] focus:outline-none"
                    />
                  </div>

                  {/* Anti-Spam Verification Checkbox */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      id="popupAntiSpamCheck"
                      checked={verifiedAntiSpam}
                      onChange={(e) => setVerifiedAntiSpam(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-[#0d4f4a] focus:ring-[#0d4f4a]"
                    />
                    <label htmlFor="popupAntiSpamCheck" className="text-stone-700 font-medium cursor-pointer flex items-center gap-1.5">
                      <span className="text-amber-500">🛡️</span>
                      <span>Tôi xác minh không phải là robot (Xác minh chống Spam)</span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="w-full py-3 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send size={15} />
                      <span>{formSubmitting ? "Đang Gửi Thông Tin..." : "GỬI YÊU CẦU TƯ VẤN NGAY"}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
