"use client";

import { useState, useEffect } from "react";
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2,
  ExternalLink,
  FileText,
  Folder,
  Link as LinkIcon,
  Layout,
  MousePointer,
  PhoneCall,
  Sparkles,
  Palette,
  Code2,
} from "lucide-react";

interface MenuItem {
  id: string;
  title: string;
  url: string;
  type: "page" | "post" | "category" | "custom";
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

export default function MenuManagerPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [formBlocks, setFormBlocks] = useState<any[]>([]);

  // Selection states for left drawers
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customLink, setCustomLink] = useState({ title: "", url: "" });

  // MULTIPLE HEADER CTA BUTTONS STATE (USER REQUIREMENT)
  const [ctaButtons, setCtaButtons] = useState<HeaderCtaButtonConfig[]>([
    {
      id: "cta-1",
      enabled: true,
      text: "Săn Deal Hot →",
      actionType: "URL",
      url: "/home#deals",
      bgColor: "#0d9488",
      textColor: "#ffffff",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/pages").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/articles").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/shortcode-blocks").then((r) => r.json()),
    ]).then(([pagesRes, catRes, artRes, setRes, blockRes]) => {
      if (pagesRes.data) setPages(pagesRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (artRes.data) setArticles(artRes.data);
      if (blockRes.blocks) {
        setFormBlocks(blockRes.blocks);
      }

      if (setRes.data) {
        if (setRes.data.header_menu) {
          try {
            setMenuItems(JSON.parse(setRes.data.header_menu));
          } catch {
            setDefaultMenu();
          }
        } else {
          setDefaultMenu();
        }

        // Parse Multiple Header CTA Buttons
        if (setRes.data.header_cta_buttons) {
          try {
            const parsed = JSON.parse(setRes.data.header_cta_buttons);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCtaButtons(parsed);
            }
          } catch {}
        } else if (setRes.data.header_cta_text) {
          // Migration from single button
          setCtaButtons([
            {
              id: "cta-1",
              enabled: setRes.data.header_cta_enabled !== "false",
              text: setRes.data.header_cta_text || "Săn Deal Hot →",
              actionType: (setRes.data.header_cta_action_type as any) || "URL",
              url: setRes.data.header_cta_url || "/home#deals",
              phone: setRes.data.header_cta_phone || "0901234567",
              popupTitle: setRes.data.header_cta_popup_title || "Đăng Ký Tư Vấn & Nhận Mã Giảm Giá",
              popupSubtitle: setRes.data.header_cta_popup_subtitle || "Để lại thông tin...",
              bgColor: setRes.data.header_cta_bg_color || "#0d9488",
              textColor: setRes.data.header_cta_text_color || "#ffffff",
              targetBlank: setRes.data.header_cta_target_blank === "true",
            },
          ]);
        }
      } else {
        setDefaultMenu();
      }
      setLoading(false);
    });
  }, []);

  const setDefaultMenu = () => {
    setMenuItems([
      { id: "1", title: "Trang chủ", url: "/", type: "custom" },
      { id: "2", title: "Thiết bị", url: "/products", type: "custom" },
      { id: "3", title: "Mẹo nhà gọn", url: "/blog", type: "custom" },
      { id: "4", title: "Mã giảm giá", url: "/deals", type: "custom" },
    ]);
  };

  const addSelectedPages = () => {
    const newItems: MenuItem[] = selectedPages.map((pageId) => {
      const p = pages.find((item) => item.id === pageId);
      return {
        id: Date.now().toString() + Math.random(),
        title: p ? p.title : "Trang",
        url: p ? `/${p.slug}` : "#",
        type: "page",
      };
    });
    setMenuItems([...menuItems, ...newItems]);
    setSelectedPages([]);
  };

  const addSelectedCategories = () => {
    const newItems: MenuItem[] = selectedCategories.map((catId) => {
      const c = categories.find((item) => item.id === catId);
      return {
        id: Date.now().toString() + Math.random(),
        title: c ? c.name : "Danh mục",
        url: c ? `/${c.slug}` : "#",
        type: "category",
      };
    });
    setMenuItems([...menuItems, ...newItems]);
    setSelectedCategories([]);
  };

  const addCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLink.title || !customLink.url) return;

    setMenuItems([
      ...menuItems,
      {
        id: Date.now().toString(),
        title: customLink.title,
        url: customLink.url,
        type: "custom",
      },
    ]);
    setCustomLink({ title: "", url: "" });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === menuItems.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...menuItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setMenuItems(updated);
  };

  const removeItem = (id: string) => {
    setMenuItems(menuItems.filter((m) => m.id !== id));
  };

  // Helper functions for CTA Buttons array
  const addCtaButton = () => {
    setCtaButtons([
      ...ctaButtons,
      {
        id: "cta-" + Date.now(),
        enabled: true,
        text: "Tư Vấn Ngay →",
        actionType: "POPUP_FORM",
        popupTitle: "Đăng Ký Nhận Tư Vấn Miễn Phí",
        popupSubtitle: "Điền thông tin để chuyên viên gọi điện tư vấn cho bạn",
        bgColor: "#0284c7",
        textColor: "#ffffff",
      },
    ]);
  };

  const updateCtaButton = (index: number, update: Partial<HeaderCtaButtonConfig>) => {
    const updated = [...ctaButtons];
    updated[index] = { ...updated[index], ...update };
    setCtaButtons(updated);
  };

  const removeCtaButton = (index: number) => {
    setCtaButtons(ctaButtons.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          header_menu: JSON.stringify(menuItems),
          header_cta_buttons: JSON.stringify(ctaButtons),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✓ Đã lưu cấu hình Menu Header & Danh Sách Nút CTA thành công!");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2 font-serif">
            <MenuIcon className="w-6 h-6 text-[#0d9488]" />
            Thiết Lập Menu Giao Diện Header &amp; Danh Sách Nút CTA
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Thêm các trang tĩnh, danh mục bài viết, đường dẫn tùy chọn và cấu hình NHIỀU NÚT BẤM CTA (Mở Link, Gọi điện, Bật Form Popup, Chèn Shortcode Form)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {msg && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 size={14} /> {msg}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0d4f4a] text-[#ffffff] font-bold text-xs hover:bg-[#083b37] transition-colors shadow-sm cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi Menu"}</span>
          </button>
        </div>
      </div>

      {/* Grid Layout matching WordPress Menu Manager */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Drawer: Pickers (Pages, Categories, Custom Link) */}
        <div className="md:col-span-5 space-y-4">
          <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
            Thêm các mục Menu
          </h2>

          {/* Static Pages Picker */}
          <details open className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 group shadow-xs">
            <summary className="font-bold text-stone-900 text-xs flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <Layout size={16} className="text-[#0d4f4a]" /> Trang Tĩnh ({pages.length})
              </span>
            </summary>
            <div className="pt-2 space-y-2 max-h-48 overflow-y-auto pr-1 text-xs border-t border-stone-100">
              {pages.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPages([...selectedPages, p.id]);
                      else setSelectedPages(selectedPages.filter((id) => id !== p.id));
                    }}
                  />
                  <span>{p.title} (/{p.slug})</span>
                </label>
              ))}
            </div>
            <button
              onClick={addSelectedPages}
              disabled={selectedPages.length === 0}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 hover:text-[#0d4f4a] font-bold text-xs rounded-xl border border-stone-200 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Thêm vào menu
            </button>
          </details>

          {/* Categories Picker */}
          <details className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 group shadow-xs">
            <summary className="font-bold text-stone-900 text-xs flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <Folder size={16} className="text-[#0d4f4a]" /> Danh Mục Bài Viết ({categories.length})
              </span>
            </summary>
            <div className="pt-2 space-y-2 max-h-48 overflow-y-auto pr-1 text-xs border-t border-stone-100">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCategories([...selectedCategories, c.id]);
                      else setSelectedCategories(selectedCategories.filter((id) => id !== c.id));
                    }}
                  />
                  <span>{c.name} (/{c.slug})</span>
                </label>
              ))}
            </div>
            <button
              onClick={addSelectedCategories}
              disabled={selectedCategories.length === 0}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 hover:text-[#0d4f4a] font-bold text-xs rounded-xl border border-stone-200 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Thêm vào menu
            </button>
          </details>

          {/* Custom Link Form */}
          <details className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 group shadow-xs">
            <summary className="font-bold text-stone-900 text-xs flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <LinkIcon size={16} className="text-[#0d4f4a]" /> Liên Kết Tự Tạo (Custom Link)
              </span>
            </summary>
            <form onSubmit={addCustomLink} className="pt-2 space-y-3 text-xs border-t border-stone-100">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Tên hiển thị menu</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Shopee Mall"
                  value={customLink.title}
                  onChange={(e) => setCustomLink({ ...customLink, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Đường dẫn URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={customLink.url}
                  onChange={(e) => setCustomLink({ ...customLink, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Thêm liên kết
              </button>
            </form>
          </details>
        </div>

        {/* Right Panel: Menu Structure & Multiple Header CTA Buttons Configuration */}
        <div className="md:col-span-7 space-y-6">
          {/* Menu Items List */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Cấu Trúc Menu Header ({menuItems.length} mục)
              </h2>
              <span className="text-xs text-stone-400 font-mono">Tên menu: header_main</span>
            </div>

            {menuItems.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs border-2 border-dashed border-stone-200 rounded-xl">
                Chưa có mục menu nào. Vui lòng thêm các mục từ bảng bên trái.
              </div>
            ) : (
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between hover:border-[#0d4f4a] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-mono text-[10px] flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[index].title = e.target.value;
                            setMenuItems(updated);
                          }}
                          className="font-bold text-stone-900 text-xs bg-transparent border-b border-dashed border-stone-300 focus:outline-none focus:border-[#0d4f4a]"
                        />
                        <span className="block text-[10px] text-stone-500 font-mono mt-0.5">
                          {item.url} | Loại: {item.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === menuItems.length - 1}
                        className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* USER REQUIREMENT: MULTIPLE HEADER CTA BUTTONS MANAGER */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <MousePointer size={18} className="text-[#0d4f4a]" />
                  <span>Quản Lý Danh Sách Nút Bấm CTA Header ({ctaButtons.length} Nút)</span>
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Thêm nhiều nút bấm CTA cạnh menu (Mở URL, Gọi hotline, Bật Popup Form, Chèn Shortcode Form)
                </p>
              </div>

              <button
                type="button"
                onClick={addCtaButton}
                className="px-3.5 py-1.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Thêm Nút Bấm CTA Mới</span>
              </button>
            </div>

            {ctaButtons.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs border-2 border-dashed border-stone-200 rounded-xl space-y-2">
                <p>Chưa có nút bấm CTA nào trên Header.</p>
                <button
                  onClick={addCtaButton}
                  className="px-4 py-2 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Tạo Nút CTA Đầu Tiên Ngay →
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {ctaButtons.map((btn, idx) => (
                  <div
                    key={btn.id || idx}
                    className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-4 relative shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b pb-2.5 border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-mono text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-stone-900 text-xs">
                          Nút CTA #{idx + 1}: {btn.text || "Chưa đặt tên"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={btn.enabled}
                            onChange={(e) => updateCtaButton(idx, { enabled: e.target.checked })}
                            className="rounded border-stone-300 text-[#0d9488]"
                          />
                          <span>Bật Nút Này</span>
                        </label>

                        {ctaButtons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCtaButton(idx)}
                            className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Xóa nút này"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Button Text Input & Live Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Text Hiển Thị Nút CTA</label>
                          <input
                            type="text"
                            value={btn.text}
                            onChange={(e) => updateCtaButton(idx, { text: e.target.value })}
                            placeholder="VD: Săn Deal Hot → hoặc Gọi 0901.234.567"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900 bg-white"
                          />
                        </div>

                        {/* Live Preview Button */}
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Xem trước nút CTA #{idx + 1}:</label>
                          <div className="p-2 bg-white rounded-xl border border-dashed border-stone-300 flex items-center justify-center min-h-[42px]">
                            <button
                              type="button"
                              style={{ backgroundColor: btn.bgColor || "#0d9488", color: btn.textColor || "#ffffff" }}
                              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-sans text-[13px] font-bold shadow-xs"
                            >
                              {btn.actionType === "CALL" && <PhoneCall size={14} />}
                              {btn.actionType === "SHORTCODE" && <Code2 size={14} />}
                              <span>{btn.text}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action Type Radio Selector (URL vs CALL vs POPUP_FORM vs SHORTCODE) */}
                      <div className="space-y-2 pt-2 border-t border-stone-200">
                        <label className="block font-bold text-stone-800">Hành động khi bấm Nút CTA #{idx + 1}:</label>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {/* Option 1: URL */}
                          <button
                            type="button"
                            onClick={() => updateCtaButton(idx, { actionType: "URL" })}
                            className={`p-2.5 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                              btn.actionType === "URL"
                                ? "bg-teal-50 border-[#0d9488] text-[#0d9488] font-bold shadow-2xs"
                                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                            }`}
                          >
                            <div className="flex items-center gap-1 text-[11px]">
                              <LinkIcon size={13} />
                              <span>1. Mở Link URL</span>
                            </div>
                          </button>

                          {/* Option 2: CALL */}
                          <button
                            type="button"
                            onClick={() => updateCtaButton(idx, { actionType: "CALL" })}
                            className={`p-2.5 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                              btn.actionType === "CALL"
                                ? "bg-rose-50 border-rose-600 text-rose-700 font-bold shadow-2xs"
                                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                            }`}
                          >
                            <div className="flex items-center gap-1 text-[11px]">
                              <PhoneCall size={13} />
                              <span>2. Gọi Hotline</span>
                            </div>
                          </button>

                          {/* Option 3: POPUP_FORM */}
                          <button
                            type="button"
                            onClick={() => updateCtaButton(idx, { actionType: "POPUP_FORM" })}
                            className={`p-2.5 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                              btn.actionType === "POPUP_FORM"
                                ? "bg-sky-50 border-[#0284c7] text-[#0284c7] font-bold shadow-2xs"
                                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                            }`}
                          >
                            <div className="flex items-center gap-1 text-[11px]">
                              <Sparkles size={13} />
                              <span>3. Popup Form</span>
                            </div>
                          </button>

                          {/* Option 4: SHORTCODE (USER REQUEST) */}
                          <button
                            type="button"
                            onClick={() => updateCtaButton(idx, { actionType: "SHORTCODE" })}
                            className={`p-2.5 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                              btn.actionType === "SHORTCODE"
                                ? "bg-amber-50 border-amber-600 text-amber-800 font-bold shadow-2xs"
                                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                            }`}
                          >
                            <div className="flex items-center gap-1 text-[11px]">
                              <Code2 size={13} />
                              <span>4. Mã Shortcode</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Conditional Fields Based on Action Type */}
                      {btn.actionType === "URL" && (
                        <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-3">
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">Đường Dẫn URL Trang Đích</label>
                            <input
                              type="text"
                              value={btn.url || ""}
                              onChange={(e) => updateCtaButton(idx, { url: e.target.value })}
                              placeholder="/home#deals hoặc https://..."
                              className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono text-xs"
                            />
                          </div>
                          <label className="flex items-center gap-2 font-medium text-stone-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={btn.targetBlank || false}
                              onChange={(e) => updateCtaButton(idx, { targetBlank: e.target.checked })}
                              className="w-4 h-4 rounded border-stone-300 text-[#0d9488]"
                            />
                            <span>Mở liên kết trong Tab mới (`target="_blank"`)</span>
                          </label>
                        </div>
                      )}

                      {btn.actionType === "CALL" && (
                        <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2">
                          <label className="block font-bold text-stone-700 mb-1">Số Điện Thoại Hotline</label>
                          <input
                            type="text"
                            value={btn.phone || ""}
                            onChange={(e) => updateCtaButton(idx, { phone: e.target.value })}
                            placeholder="0901234567"
                            className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono text-xs font-bold text-rose-700"
                          />
                        </div>
                      )}

                      {btn.actionType === "POPUP_FORM" && (
                        <div className="p-3.5 bg-white rounded-xl border border-sky-200 space-y-3">
                          {/* FORM SELECTOR FROM SAVED SHORTCODE BLOCKS (USER REQUIREMENT) */}
                          <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-200 space-y-1">
                            <label className="block font-bold text-sky-900 text-xs">
                              📋 Chọn Form Đăng Ký Trong Danh Sách Đã Lưu (Shortcode Library)
                            </label>
                            <select
                              value={btn.formBlockKey || "form-header"}
                              onChange={(e) =>
                                updateCtaButton(idx, {
                                  formBlockKey: e.target.value,
                                  shortcodeTag: `[block key="${e.target.value}"]`,
                                })
                              }
                              className="w-full px-3 py-1.5 border border-sky-300 rounded-lg font-bold text-xs text-sky-900 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            >
                              <option value="form-header">Form Đăng Ký Header (Mặc Định)</option>
                              {formBlocks.map((blk) => (
                                <option key={blk.id} value={blk.key}>
                                  {blk.name} (Key: [block key="{blk.key}"])
                                </option>
                              ))}
                            </select>
                            <span className="text-[10px] text-sky-700 block">
                              💡 Chọn đúng mẫu Form bạn đã thiết kế trong trang Quản Lý Block Shortcode (/admin/shortcodes).
                            </span>
                          </div>
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">Tiêu Đề Khung Popup Form</label>
                            <input
                              type="text"
                              value={btn.popupTitle || ""}
                              onChange={(e) => updateCtaButton(idx, { popupTitle: e.target.value })}
                              placeholder="Đăng Ký Tư Vấn & Nhận Mã Giảm Giá"
                              className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-bold text-stone-900"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">Mô Tả Hướng Dẫn Kèm Theo Popup</label>
                            <input
                              type="text"
                              value={btn.popupSubtitle || ""}
                              onChange={(e) => updateCtaButton(idx, { popupSubtitle: e.target.value })}
                              placeholder="Để lại thông tin, chuyên viên sẽ gọi điện tư vấn..."
                              className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-stone-700"
                            />
                          </div>

                          {/* SUCCESS SCREEN CUSTOMIZATION (USER REQUIREMENT) */}
                          <div className="pt-2 border-t border-sky-100 space-y-2.5">
                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                              🎉 Tùy Chỉnh Khung Thông Báo Sau Khi Điền Form Thành Công:
                            </span>
                            <div>
                              <label className="block font-bold text-stone-700 mb-1">Tiêu Đề Thông Báo Thành Công</label>
                              <input
                                type="text"
                                value={btn.popupSuccessTitle || ""}
                                onChange={(e) => updateCtaButton(idx, { popupSuccessTitle: e.target.value })}
                                placeholder="Gửi Thông Tin Thành Công!"
                                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-bold text-emerald-700"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-stone-700 mb-1">Mô Tả Lời Cảm Ơn / Hướng Dẫn Kế Tiếp</label>
                              <input
                                type="text"
                                value={btn.popupSuccessMsg || ""}
                                onChange={(e) => updateCtaButton(idx, { popupSuccessMsg: e.target.value })}
                                placeholder="Cảm ơn bạn! Chuyên viên tư vấn sẽ liên hệ lại với số điện thoại của bạn trong ít phút."
                                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-stone-700"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-stone-700 mb-1">Text Nút Bấm Đóng Khung</label>
                              <input
                                type="text"
                                value={btn.popupSuccessBtnText || ""}
                                onChange={(e) => updateCtaButton(idx, { popupSuccessBtnText: e.target.value })}
                                placeholder="Hoàn Tất & Đóng Khung"
                                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-bold text-stone-800"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SHORTCODE ACTION TYPE (USER REQUEST) */}
                      {btn.actionType === "SHORTCODE" && (
                        <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-3">
                          <div>
                            <label className="block font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                              <Code2 size={14} className="text-amber-600" />
                              <span>Mã Shortcode Hoặc Block Key Muốn Bật Trong Popup:</span>
                            </label>
                            <input
                              type="text"
                              value={btn.shortcodeTag || ""}
                              onChange={(e) => updateCtaButton(idx, { shortcodeTag: e.target.value })}
                              placeholder='[block key="form-header"] hoặc key form-header'
                              className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs font-bold text-amber-700"
                            />
                            <span className="text-[11px] text-stone-500 mt-1 block">
                              Ví dụ: Nhập <code>[block key="form-header"]</code> để hiển thị Form tùy biến đã thiết lập từ Thư Viện Block!
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Colors */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Màu Nền Nút CTA</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={btn.bgColor || "#0d9488"}
                              onChange={(e) => updateCtaButton(idx, { bgColor: e.target.value })}
                              className="w-7 h-7 rounded border cursor-pointer"
                            />
                            <input
                              type="text"
                              value={btn.bgColor || "#0d9488"}
                              onChange={(e) => updateCtaButton(idx, { bgColor: e.target.value })}
                              className="flex-1 px-2.5 py-1 border border-stone-300 rounded font-mono text-xs uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Màu Chữ Nút CTA</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={btn.textColor || "#ffffff"}
                              onChange={(e) => updateCtaButton(idx, { textColor: e.target.value })}
                              className="w-7 h-7 rounded border cursor-pointer"
                            />
                            <input
                              type="text"
                              value={btn.textColor || "#ffffff"}
                              onChange={(e) => updateCtaButton(idx, { textColor: e.target.value })}
                              className="flex-1 px-2.5 py-1 border border-stone-300 rounded font-mono text-xs uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
