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

  // Footer Configuration States
  const [footerFont, setFooterFont] = useState<"default" | "sans" | "serif" | "mono">("mono");
  const [footerDesc, setFooterDesc] = useState("Chia sẻ mẹo hay, sản phẩm tiện ích và giải pháp giúp cuộc sống nhẹ nhàng hơn mỗi ngày. Tự động áp mã giảm giá Shopee ưu đãi Facebook.");
  const [footerEmail, setFooterEmail] = useState("hello@luoidonnha.com");
  const [footerCopyright, setFooterCopyright] = useState("© 2026 LƯỜI DỌN NHÀ. Bản quyền thuộc về luoidonnha.com.");
  const [col1Title, setCol1Title] = useState("KHÁM PHÁ");
  const [col1LinksStr, setCol1LinksStr] = useState(JSON.stringify([
    { label: "Blog & Mẹo Hay", url: "/blog" },
    { label: "Sản phẩm tiện ích", url: "/san-pham" },
    { label: "Icon Facebook", url: "/#tool-widget" },
    { label: "Mã giảm giá Shopee", url: "/#tool-widget" },
  ], null, 2));
  const [col2Title, setCol2Title] = useState("HỖ TRỢ");
  const [col2LinksStr, setCol2LinksStr] = useState(JSON.stringify([
    { label: "Hướng dẫn dán link", url: "/#guide" },
    { label: "Câu hỏi thường gặp", url: "/#faq" },
    { label: "Điều khoản dịch vụ", url: "/#terms" },
    { label: "Liên hệ hỗ trợ", url: "/#contact" },
  ], null, 2));
  const [socialFb, setSocialFb] = useState("https://facebook.com");
  const [socialInsta, setSocialInsta] = useState("https://instagram.com");
  const [socialTiktok, setSocialTiktok] = useState("https://tiktok.com");
  const [socialYoutube, setSocialYoutube] = useState("https://youtube.com");
  const [footerBg, setFooterBg] = useState("#ffffff");

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

        // Footer settings
        if (setRes.data.footer_font) setFooterFont(setRes.data.footer_font as any);
        if (setRes.data.footer_description) setFooterDesc(setRes.data.footer_description);
        if (setRes.data.footer_email) setFooterEmail(setRes.data.footer_email);
        if (setRes.data.footer_copyright) setFooterCopyright(setRes.data.footer_copyright);
        if (setRes.data.footer_col1_title) setCol1Title(setRes.data.footer_col1_title);
        if (setRes.data.footer_col1_links) setCol1LinksStr(setRes.data.footer_col1_links);
        if (setRes.data.footer_col2_title) setCol2Title(setRes.data.footer_col2_title);
        if (setRes.data.footer_col2_links) setCol2LinksStr(setRes.data.footer_col2_links);
        if (setRes.data.footer_social_fb !== undefined) setSocialFb(setRes.data.footer_social_fb);
        if (setRes.data.footer_social_insta !== undefined) setSocialInsta(setRes.data.footer_social_insta);
        if (setRes.data.footer_social_tiktok !== undefined) setSocialTiktok(setRes.data.footer_social_tiktok);
        if (setRes.data.footer_social_youtube !== undefined) setSocialYoutube(setRes.data.footer_social_youtube);
        if (setRes.data.footer_bg_color) setFooterBg(setRes.data.footer_bg_color);

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
          footer_font: footerFont,
          footer_description: footerDesc,
          footer_email: footerEmail,
          footer_copyright: footerCopyright,
          footer_col1_title: col1Title,
          footer_col1_links: col1LinksStr,
          footer_col2_title: col2Title,
          footer_col2_links: col2LinksStr,
          footer_social_fb: socialFb,
          footer_social_insta: socialInsta,
          footer_social_tiktok: socialTiktok,
          footer_social_youtube: socialYoutube,
          footer_bg_color: footerBg,
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
        {/* HOMEPAGE DISPLAY SETTINGS (MOVED TO TOP PER USER REQUEST) */}
        <div>
          <h2 className="text-base font-bold font-serif text-stone-900 mb-4 pb-2 border-b flex items-center gap-2">
            <Layout size={18} className="text-[#0d4f4a]" />
            Cài Đặt Hiển Thị Trang Chủ
          </h2>
          <div className="space-y-4 text-xs bg-stone-50 p-5 rounded-2xl border border-stone-200 font-mono">
            <label className="block font-bold text-stone-800 text-sm">Trang chủ của bạn hiển thị:</label>

            <div className="space-y-3 pl-2">
              <label className="flex items-center gap-2.5 font-bold text-stone-700 cursor-pointer p-2.5 bg-white rounded-xl border border-stone-200 hover:border-[#0d4f4a] transition-all">
                <input
                  type="radio"
                  name="homepageType"
                  value="blog"
                  checked={homepageType === "blog"}
                  onChange={() => setHomepageType("blog")}
                  className="w-4 h-4 text-[#0d4f4a]"
                />
                <span>Bài viết mới nhất (Giao diện Mặc định đầy đủ Hero Banner &amp; Deals)</span>
              </label>

              <label className="flex items-start gap-2.5 font-bold text-stone-700 cursor-pointer p-2.5 bg-white rounded-xl border border-stone-200 hover:border-[#0d4f4a] transition-all">
                <input
                  type="radio"
                  name="homepageType"
                  value="static"
                  checked={homepageType === "static"}
                  onChange={() => setHomepageType("static")}
                  className="mt-1 w-4 h-4 text-[#0d4f4a]"
                />
                <div className="space-y-2.5 flex-1">
                  <span>Một trang tĩnh (Chọn trang tĩnh LadiPage / UX Builder bên dưới):</span>
                  {homepageType === "static" && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-bold text-[#0d4f4a]">Chọn Trang chủ:</span>
                      <select
                        value={homepagePageId}
                        onChange={(e) => setHomepagePageId(e.target.value)}
                        className="px-3.5 py-2 border border-stone-300 rounded-xl font-bold text-stone-900 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#0d4f4a] text-xs"
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

        {/* FOOTER CONFIGURATION SECTION (USER REQUEST) */}
        <div>
          <h2 className="text-base font-bold font-serif text-stone-900 mb-4 pb-2 border-b flex items-center gap-2">
            <Layout size={18} className="text-[#0d4f4a]" />
            Cấu Hình Chân Trang (Footer - Đồng Bộ Font Chữ, Cột Menu, Mạng Xã Hội &amp; Bản Quyền)
          </h2>

          <div className="space-y-6 bg-stone-50 p-5 rounded-2xl border border-stone-200 text-xs font-mono">
            {/* Font Family & Background Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-800 mb-1.5">Font Chữ Chân Trang (Footer Font):</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "mono", name: "Mono (Kỹ thuật/Modern)" },
                    { id: "serif", name: "Serif (Sang trọng/Báo chí)" },
                    { id: "sans", name: "Sans (Thanh lịch)" },
                    { id: "default", name: "Mặc định hệ thống" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFooterFont(f.id as any)}
                      className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                        footerFont === f.id
                          ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                          : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1.5">Màu Nền Chân Trang (Footer Background):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={footerBg}
                    onChange={(e) => setFooterBg(e.target.value)}
                    className="w-10 h-9 p-1 border rounded-lg cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={footerBg}
                    onChange={(e) => setFooterBg(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-xl bg-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Description & Support Email & Copyright */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block font-bold text-stone-800 mb-1">Mô Tả Thương Hiệu / Giới Thiệu Chân Trang:</label>
                <textarea
                  rows={2}
                  value={footerDesc}
                  onChange={(e) => setFooterDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-sans text-xs focus:ring-1 focus:ring-[#0d4f4a]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Email Hỗ Trợ Khách Hàng:</label>
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="hello@luoidonnha.com"
                  className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-stone-800 mb-1">Dòng Bản Quyền Cuối Trang (Copyright):</label>
                <input
                  type="text"
                  value={footerCopyright}
                  onChange={(e) => setFooterCopyright(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                />
              </div>
            </div>

            {/* Menu Column 1 & Menu Column 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
              <div className="space-y-2">
                <label className="block font-bold text-stone-800">Tiêu đề &amp; Liên kết Cột 1 (JSON Links):</label>
                <input
                  type="text"
                  value={col1Title}
                  onChange={(e) => setCol1Title(e.target.value)}
                  placeholder="KHÁM PHÁ"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-bold text-xs mb-1"
                />
                <textarea
                  rows={4}
                  value={col1LinksStr}
                  onChange={(e) => setCol1LinksStr(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-mono text-[11px] focus:ring-1 focus:ring-[#0d4f4a]"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-stone-800">Tiêu đề &amp; Liên kết Cột 2 (JSON Links):</label>
                <input
                  type="text"
                  value={col2Title}
                  onChange={(e) => setCol2Title(e.target.value)}
                  placeholder="HỖ TRỢ"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-bold text-xs mb-1"
                />
                <textarea
                  rows={4}
                  value={col2LinksStr}
                  onChange={(e) => setCol2LinksStr(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-mono text-[11px] focus:ring-1 focus:ring-[#0d4f4a]"
                />
              </div>
            </div>

            {/* Social Media Channels */}
            <div className="pt-2 border-t border-stone-200">
              <label className="block font-bold text-stone-800 mb-2">Đường Dẫn Mạng Xã Hội (Social Media Icons):</label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 block mb-1">Facebook URL:</span>
                  <input
                    type="text"
                    value={socialFb}
                    onChange={(e) => setSocialFb(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-pink-600 block mb-1">Instagram URL:</span>
                  <input
                    type="text"
                    value={socialInsta}
                    onChange={(e) => setSocialInsta(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-stone-900 block mb-1">TikTok URL:</span>
                  <input
                    type="text"
                    value={socialTiktok}
                    onChange={(e) => setSocialTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@..."
                    className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-red-600 block mb-1">YouTube URL:</span>
                  <input
                    type="text"
                    value={socialYoutube}
                    onChange={(e) => setSocialYoutube(e.target.value)}
                    placeholder="https://youtube.com/@..."
                    className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                  />
                </div>
              </div>
            </div>
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
