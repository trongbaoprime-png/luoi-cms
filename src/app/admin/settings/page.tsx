"use client";

import { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, Layout, Image as ImageIcon, Monitor, Smartphone, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import MediaPickerModal from "@/components/MediaPickerModal";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("Lười Dọn Nhà");
  const [slogan, setSlogan] = useState("Nhà vẫn gọn, dù bạn rất lười");
  const [homepageType, setHomepageType] = useState<"blog" | "static">("static");
  const [homepagePageId, setHomepagePageId] = useState("");
  const [pages, setPages] = useState<any[]>([]);
  const [metaPixelId, setMetaPixelId] = useState("1234567890");

  // Logo & Alignment Configuration States
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPosDesktop, setLogoPosDesktop] = useState<"left" | "center" | "right">("left");
  const [logoPosMobile, setLogoPosMobile] = useState<"left" | "center" | "right">("left");
  const [menuPosDesktop, setMenuPosDesktop] = useState<"left" | "center" | "right">("right");
  const [logoHeightDesktop, setLogoHeightDesktop] = useState(40);
  const [logoHeightMobile, setLogoHeightMobile] = useState(32);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Menu Font & Color States
  const [menuFont, setMenuFont] = useState<"default" | "sans" | "serif" | "mono">("default");
  const [menuColorText, setMenuColorText] = useState("#44403c");
  const [menuColorHover, setMenuColorHover] = useState("#0d4f4a");
  const [menuColorActive, setMenuColorActive] = useState("#0d4f4a");

  // Search Engine & CDN & Indexing States
  const [discourageSearchEngines, setDiscourageSearchEngines] = useState(false);
  const [cdnUrl, setCdnUrl] = useState("https://media.luoidonnha.com");
  const [indexnowApiKey, setIndexnowApiKey] = useState("luoidonnha2026indexnowkey");
  const [indexingMsg, setIndexingMsg] = useState("");
  const [submittingIndex, setSubmittingIndex] = useState(false);

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/pages").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([pagesRes, setRes]) => {
      if (pagesRes.data) {
        setPages(pagesRes.data);
        if (!homepagePageId && pagesRes.data.length > 0) {
          setHomepagePageId(pagesRes.data[0].id);
        }
      }
      if (setRes.data) {
        if (setRes.data.site_name) setSiteName(setRes.data.site_name);
        if (setRes.data.slogan) setSlogan(setRes.data.slogan);
        if (setRes.data.homepage_type) setHomepageType(setRes.data.homepage_type as any);
        if (setRes.data.homepage_page_id) setHomepagePageId(setRes.data.homepage_page_id);
        if (setRes.data.meta_pixel_id) setMetaPixelId(setRes.data.meta_pixel_id);

        // Logo settings
        if (setRes.data.logo_url) setLogoUrl(setRes.data.logo_url);
        if (setRes.data.logo_pos_desktop) setLogoPosDesktop(setRes.data.logo_pos_desktop as any);
        if (setRes.data.logo_pos_mobile) setLogoPosMobile(setRes.data.logo_pos_mobile as any);
        if (setRes.data.menu_pos_desktop) setMenuPosDesktop(setRes.data.menu_pos_desktop as any);
        if (setRes.data.logo_height_desktop) setLogoHeightDesktop(Number(setRes.data.logo_height_desktop));
        if (setRes.data.logo_height_mobile) setLogoHeightMobile(Number(setRes.data.logo_height_mobile));

        // Menu font & color settings
        if (setRes.data.menu_font) setMenuFont(setRes.data.menu_font as any);
        if (setRes.data.menu_color_text) setMenuColorText(setRes.data.menu_color_text);
        if (setRes.data.menu_color_hover) setMenuColorHover(setRes.data.menu_color_hover);
        if (setRes.data.menu_color_active) setMenuColorActive(setRes.data.menu_color_active);

        // SEO & Indexing settings
        if (setRes.data.discourage_search_engines !== undefined) {
          setDiscourageSearchEngines(setRes.data.discourage_search_engines === "true");
        }
        if (setRes.data.cdn_url) setCdnUrl(setRes.data.cdn_url);
        if (setRes.data.indexnow_api_key) setIndexnowApiKey(setRes.data.indexnow_api_key);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName,
          slogan,
          homepage_type: homepageType,
          homepage_page_id: homepagePageId,
          meta_pixel_id: metaPixelId,
          logo_url: logoUrl,
          logo_pos_desktop: logoPosDesktop,
          logo_pos_mobile: logoPosMobile,
          menu_pos_desktop: menuPosDesktop,
          logo_height_desktop: String(logoHeightDesktop),
          logo_height_mobile: String(logoHeightMobile),
          menu_font: menuFont,
          menu_color_text: menuColorText,
          menu_color_hover: menuColorHover,
          menu_color_active: menuColorActive,
          discourage_search_engines: String(discourageSearchEngines),
          cdn_url: cdnUrl,
          indexnow_api_key: indexnowApiKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        // Xóa sessionStorage cache của Header để cập nhật ngay
        try { sessionStorage.removeItem("luoi_header_settings_v2"); } catch {}
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
  };

  const handleTriggerIndexing = async () => {
    setSubmittingIndex(true);
    setIndexingMsg("Đang gửi yêu cầu Lập chỉ mục tới Google & Bing...");
    try {
      const res = await fetch("/api/admin/indexing", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIndexingMsg(data.message);
      } else {
        setIndexingMsg("Lỗi: " + (data.error || "Không gửi được yêu cầu"));
      }
    } catch {
      setIndexingMsg("Lỗi kết nối máy chủ");
    } finally {
      setSubmittingIndex(false);
      setTimeout(() => setIndexingMsg(""), 5000);
    }
  };

  const handleSelectLogoMedia = (url: string) => {
    setLogoUrl(url);
    setIsMediaModalOpen(false);
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      {/* Media Picker Modal for Logo Upload/Select */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={handleSelectLogoMedia}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2 font-serif">
          <Settings className="w-6 h-6 text-[#0d9488]" />
          Cấu Hình Cài Đặt Hệ Thống &amp; Hiển Thị Trang Chủ
        </h1>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Đã lưu cài đặt hệ thống &amp; cấu hình Logo thành công!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-8">
        {/* LOGO CONFIGURATION SECTION (USER REQUEST) */}
        <div>
          <h2 className="text-base font-bold font-serif text-stone-900 mb-4 pb-2 border-b flex items-center gap-2">
            <ImageIcon size={18} className="text-[#0d4f4a]" />
            Cấu Hình Logo Header / Menu (Tải Ảnh &amp; Căn Vị Trí Mobile/Desktop)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-5 rounded-2xl border border-stone-200">
            {/* Logo Image Upload / URL & Live Preview */}
            <div className="space-y-3 text-xs font-mono">
              <label className="block font-bold text-stone-800">Hình Ảnh Logo Website</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://domain.com/logo.png hoặc /uploads/logo.png"
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono text-xs focus:ring-1 focus:ring-[#0d4f4a]"
                />
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-3.5 py-2 bg-[#0d4f4a] hover:bg-[#083b37] text-white rounded-xl font-mono font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  📁 Thư viện Media
                </button>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                <span className="text-[11px] font-mono text-stone-500 font-semibold block">Xem trước Logo:</span>
                <div className="flex items-center justify-center p-4 bg-stone-100/80 rounded-lg min-h-[70px] border border-dashed border-stone-300">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Website Logo Preview"
                      style={{ maxHeight: `${logoHeightDesktop}px` }}
                      className="object-contain transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#0d4f4a] text-white flex items-center justify-center font-sans font-black text-sm">
                        L
                      </span>
                      <span className="font-serif font-bold text-lg text-stone-900">
                        {siteName || "LƯỜI DỌN NHÀ"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Alignment Controls for Desktop & Mobile */}
            <div className="space-y-5 text-xs font-mono">
              {/* Desktop Position Switcher */}
              <div className="space-y-2">
                <label className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Monitor size={15} className="text-[#0d4f4a]" />
                  <span>Vị trí hiển thị trên Desktop (Máy tính):</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogoPosDesktop("left")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      logoPosDesktop === "left"
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span>Trái (Left)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoPosDesktop("center")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      logoPosDesktop === "center"
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span>Ở Giữa (Center)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoPosDesktop("right")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      logoPosDesktop === "right"
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span>Phải (Right)</span>
                  </button>
                </div>
              </div>

              {/* Desktop Menu Position Switcher */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Monitor size={15} className="text-[#0d4f4a]" />
                  <span>Vị trí Menu ngang (Máy tính):</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMenuPosDesktop("left")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      menuPosDesktop === "left"
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span>Trái (Gần Logo)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMenuPosDesktop("center")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      menuPosDesktop === "center"
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span>Ở Giữa (Center)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMenuPosDesktop("right")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      menuPosDesktop === "right"
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span>Phải (Right)</span>
                  </button>
                </div>
              </div>

              {/* Mobile Position Switcher */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Smartphone size={15} className="text-[#0d4f4a]" />
                  <span>Vị trí hiển thị trên Mobile (Điện thoại):</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogoPosMobile("left")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      logoPosMobile === "left"
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span>Trái (Left)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoPosMobile("center")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      logoPosMobile === "center"
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span>Ở Giữa (Center)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoPosMobile("right")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      logoPosMobile === "right"
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span>Phải (Right)</span>
                  </button>
                </div>
              </div>

              {/* Logo Height Sliders */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Chiều cao Desktop: <span className="font-mono text-[#0d4f4a] font-bold">{logoHeightDesktop}px</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={logoHeightDesktop}
                    onChange={(e) => setLogoHeightDesktop(Number(e.target.value))}
                    className="w-full accent-[#0d4f4a]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Chiều cao Mobile: <span className="font-mono text-[#0d4f4a] font-bold">{logoHeightMobile}px</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={logoHeightMobile}
                    onChange={(e) => setLogoHeightMobile(Number(e.target.value))}
                    className="w-full accent-[#0d4f4a]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WordPress Style Reading Settings Section */}
        {/* MENU FONT & COLOR CONFIGURATION */}
        <div>
          <h2 className="text-base font-bold font-serif text-stone-900 mb-4 pb-2 border-b flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#0d4f4a] text-white text-[11px] font-black flex items-center justify-center shrink-0">T</span>
            Cấu Hình Font &amp; Màu Sắc Menu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-5 rounded-2xl border border-stone-200 text-xs font-mono">

            {/* Font Menu */}
            <div className="space-y-3">
              <label className="block font-bold text-stone-800">Font chữ Menu</label>
              <p className="text-[11px] text-stone-500">Mặc định kế thừa font hệ thống (font-mono). Chọn để ghi đè.</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "default", label: "Mặc định", hint: "Kế thừa hệ thống" },
                  { value: "sans", label: "Sans-Serif", hint: "Inter / system-ui" },
                  { value: "serif", label: "Serif", hint: "Georgia" },
                  { value: "mono", label: "Monospace", hint: "JetBrains Mono" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMenuFont(opt.value)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border transition-all cursor-pointer gap-0.5 ${
                      menuFont === opt.value
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span className="font-bold text-xs">{opt.label}</span>
                    <span className={`text-[10px] ${menuFont === opt.value ? "text-teal-100/80" : "text-stone-400"}`}>{opt.hint}</span>
                  </button>
                ))}
              </div>

              {/* Live preview */}
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-400 font-mono block mb-2">Xem trước menu:</span>
                <div
                  className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider"
                  style={{
                    fontFamily:
                      menuFont === "sans" ? "system-ui, sans-serif"
                      : menuFont === "serif" ? "Georgia, serif"
                      : menuFont === "mono" ? "'JetBrains Mono', monospace"
                      : undefined,
                    color: menuColorText,
                  }}
                >
                  <span style={{ color: menuColorActive, borderBottom: `2px solid ${menuColorActive}`, paddingBottom: "2px" }}>Trang Chủ</span>
                  <span>Blog</span>
                  <span style={{ color: menuColorHover }}>Hover</span>
                </div>
              </div>
            </div>

            {/* Color Controls */}
            <div className="space-y-4">
              <label className="block font-bold text-stone-800">Màu sắc Menu</label>

              {/* Text Color */}
              <div className="space-y-1.5">
                <label className="block text-stone-600 font-semibold">Màu chữ mặc định</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={menuColorText} onChange={(e) => setMenuColorText(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white" />
                  <input type="text" value={menuColorText} onChange={(e) => setMenuColorText(e.target.value)}
                    placeholder="#44403c"
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono text-xs focus:ring-1 focus:ring-[#0d4f4a]" />
                  <button type="button" onClick={() => setMenuColorText("#44403c")}
                    className="px-2.5 py-2 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl border border-stone-300 cursor-pointer transition-colors font-mono">
                    Reset
                  </button>
                </div>
              </div>

              {/* Hover Color */}
              <div className="space-y-1.5">
                <label className="block text-stone-600 font-semibold">Màu khi Hover</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={menuColorHover} onChange={(e) => setMenuColorHover(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white" />
                  <input type="text" value={menuColorHover} onChange={(e) => setMenuColorHover(e.target.value)}
                    placeholder="#0d4f4a"
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono text-xs focus:ring-1 focus:ring-[#0d4f4a]" />
                  <button type="button" onClick={() => setMenuColorHover("#0d4f4a")}
                    className="px-2.5 py-2 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl border border-stone-300 cursor-pointer transition-colors font-mono">
                    Reset
                  </button>
                </div>
              </div>

              {/* Active Color */}
              <div className="space-y-1.5">
                <label className="block text-stone-600 font-semibold">Màu Active (trang đang xem)</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={menuColorActive} onChange={(e) => setMenuColorActive(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white" />
                  <input type="text" value={menuColorActive} onChange={(e) => setMenuColorActive(e.target.value)}
                    placeholder="#0d4f4a"
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono text-xs focus:ring-1 focus:ring-[#0d4f4a]" />
                  <button type="button" onClick={() => setMenuColorActive("#0d4f4a")}
                    className="px-2.5 py-2 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl border border-stone-300 cursor-pointer transition-colors font-mono">
                    Reset
                  </button>
                </div>
                <p className="text-[11px] text-stone-400">Mặc định: <code className="bg-stone-100 px-1 rounded">#0d4f4a</code> (Forest Teal)</p>
              </div>
            </div>
          </div>
        </div>

        {/* WordPress Style Reading Settings Section - DO NOT REMOVE BELOW */}
        <div>
          <h2 className="text-base font-bold font-serif text-stone-900 mb-4 pb-2 border-b flex items-center gap-2">
            <Layout size={18} className="text-[#0d4f4a]" />
            Cài Đặt Đọc (Hiển Thị Trang Chủ Website - WordPress Reading Settings)
          </h2>
          <div className="space-y-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
            <label className="block font-semibold text-stone-800">Trang chủ của bạn hiển thị:</label>

            <div className="space-y-2 pl-2">
              <label className="flex items-center gap-2 font-medium text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  name="homepageType"
                  value="blog"
                  checked={homepageType === "blog"}
                  onChange={() => setHomepageType("blog")}
                />
                <span>Bài viết mới nhất (Tạp chí kỹ thuật &amp; ROI)</span>
              </label>

              <label className="flex items-start gap-2 font-medium text-stone-700 cursor-pointer pt-1">
                <input
                  type="radio"
                  name="homepageType"
                  value="static"
                  checked={homepageType === "static"}
                  onChange={() => setHomepageType("static")}
                  className="mt-0.5"
                />
                <div className="space-y-2">
                  <span>Một trang tĩnh (Chọn trang tĩnh LadiPage / UX Builder bên dưới):</span>
                  {homepageType === "static" && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-bold text-stone-600">Trang chủ:</span>
                      <select
                        value={homepagePageId}
                        onChange={(e) => setHomepagePageId(e.target.value)}
                        className="px-3 py-1.5 border border-stone-300 rounded-lg font-bold text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      >
                        {pages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} (/{p.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b">Thương Hiệu &amp; Cấu Hình CDN Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tên Website</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Slogan</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tên Miền Phụ CDN Ảnh (CDN Base URL)</label>
              <input
                type="text"
                value={cdnUrl}
                onChange={(e) => setCdnUrl(e.target.value)}
                placeholder="https://media.luoidonnha.com"
                className="w-full px-3 py-2 border rounded-xl font-mono text-teal-700 font-bold"
              />
            </div>
          </div>
        </div>

        {/* WordPress Style Search Engine Visibility Setting & Instant Indexing */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-stone-900 mb-2 pb-2 border-b">Lập Chỉ Mục SEO &amp; Cấu Hình Công Cụ Tìm Kiếm</h2>

          {/* WordPress Exact Checkbox UI */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-start gap-4">
              <span className="font-bold text-stone-900 text-xs w-36 shrink-0 pt-0.5">
                Hiển thị trên Google
              </span>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 font-bold text-stone-800 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discourageSearchEngines}
                    onChange={(e) => setDiscourageSearchEngines(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Nếu tích chọn, Trang web sẽ được cài đặt để ẩn khỏi công cụ tìm kiếm</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Lưu ý: Một số công cụ tìm kiếm có thể vẫn hiển thị nội dung.
                </p>
              </div>
            </div>
          </div>

          {/* Instant Indexing Section (Google & Bing IndexNow) */}
          <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-teal-900 text-xs uppercase tracking-wider">🚀 Lập Chỉ Mục Tức Thì (Instant Indexing) khi Bài Viết Publish</h3>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  Tự động phát tín hiệu index cấp tốc tới GoogleBot &amp; Bing IndexNow Engine ngay khi xuất bản bài viết.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerIndexing}
                disabled={submittingIndex}
                className="px-4 py-2 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-mono"
              >
                <span>🚀 Gửi Index Bài Viết Ngay</span>
              </button>
            </div>

            {indexingMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-mono font-bold ${indexingMsg.includes("✓") ? "bg-[#0d4f4a]/10 text-[#0d4f4a] border border-[#0d4f4a]/30" : "bg-[#f7f4ed] text-[#5c564f] border border-[#d8d2c2]"}`}>
                {indexingMsg}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold font-serif text-stone-900 mb-4 pb-2 border-b">Cấu Hình Ads &amp; Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Meta Pixel ID</label>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="1234567890"
                className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end font-mono">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0d4f4a] text-white font-bold text-xs rounded-xl hover:bg-[#083b37] transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu Cài Đặt Hệ Thống
          </button>
        </div>
      </form>
    </div>
  );
}
