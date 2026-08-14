"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileCode, Plus, Trash2, ExternalLink, Layers, Sparkles, Globe, Edit2, CheckCircle2, Image as ImageIcon, X, RefreshCw } from "lucide-react";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  keywords?: string;
  noIndex?: boolean;
  isPublished: boolean;
  useDefaultHeader: boolean;
  useDefaultFooter: boolean;
  createdAt: string;
}

export default function AdminPagesManagerPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [useDefaultHeader, setUseDefaultHeader] = useState(true);
  const [useDefaultFooter, setUseDefaultFooter] = useState(true);
  const [loading, setLoading] = useState(false);

  // SEO State for Creation Form (Always visible)
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [noIndex, setNoIndex] = useState(false);

  // Edit Modal State
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSeoTitle, setEditSeoTitle] = useState("");
  const [editSeoDescription, setEditSeoDescription] = useState("");
  const [editOgImage, setEditOgImage] = useState("");
  const [editCanonicalUrl, setEditCanonicalUrl] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [editNoIndex, setEditNoIndex] = useState(false);
  const [editUseHeader, setEditUseHeader] = useState(true);
  const [editUseFooter, setEditUseFooter] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  const fetchPages = () => {
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPages(data.data);
      });
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
    if (!seoTitle) {
      setSeoTitle(`${val} | Lười Dọn Nhà`);
    }
    if (!canonicalUrl) {
      setCanonicalUrl(`https://luoidonnha.com/${generatedSlug}`);
    }
  };

  const handleAutoFillSeo = () => {
    if (!title) return;
    setSeoTitle(`${title} - Ưu đãi & Khảo sát miễn phí | Lười Dọn Nhà`);
    setSeoDescription(`Khám phá dịch vụ ${title} chuyên nghiệp tại Lười Dọn Nhà. Cam kết sạch sẽ, nhanh chóng, bảo hành chu đáo.`);
    if (slug) {
      setCanonicalUrl(`https://luoidonnha.com/${slug}`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;
    setLoading(true);

    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content: content || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          ogImage: ogImage || null,
          canonicalUrl: canonicalUrl || null,
          keywords: keywords || null,
          noIndex,
          useDefaultHeader,
          useDefaultFooter,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setSlug("");
        setContent("");
        setSeoTitle("");
        setSeoDescription("");
        setOgImage("");
        setCanonicalUrl("");
        setKeywords("");
        setNoIndex(false);
        setUseDefaultHeader(true);
        setUseDefaultFooter(true);
        fetchPages();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (p: StaticPage) => {
    setEditingPage(p);
    setEditTitle(p.title);
    setEditSlug(p.slug);
    setEditSeoTitle(p.seoTitle || "");
    setEditSeoDescription(p.seoDescription || "");
    setEditOgImage(p.ogImage || "");
    setEditCanonicalUrl(p.canonicalUrl || `https://luoidonnha.com/${p.slug}`);
    setEditKeywords(p.keywords || "");
    setEditNoIndex(p.noIndex || false);
    setEditUseHeader(p.useDefaultHeader);
    setEditUseFooter(p.useDefaultFooter);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || !editTitle || !editSlug) return;
    setEditLoading(true);

    try {
      const res = await fetch(`/api/pages/${editingPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          slug: editSlug,
          seoTitle: editSeoTitle || null,
          seoDescription: editSeoDescription || null,
          ogImage: editOgImage || null,
          canonicalUrl: editCanonicalUrl || null,
          keywords: editKeywords || null,
          noIndex: editNoIndex,
          useDefaultHeader: editUseHeader,
          useDefaultFooter: editUseFooter,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingPage(null);
        fetchPages();
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trang này không? Toàn bộ thiết kế sẽ bị xóa.")) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchPages();
      }
    } catch {}
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-[#0d4f4a]" />
            <span>Quản Lý Landing Page &amp; Tối Ưu SEO Meta ({pages.length})</span>
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Thiết kế Landing Page bằng Studio kéo thả, cấu hình SEO Title, Description, Thumbnail OG &amp; Từ khóa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Create Page (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm h-fit space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-base font-bold font-serif text-stone-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#0d4f4a]" />
              <span>Thêm Landing Page Mới</span>
            </h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Tên Trang Landing Page *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="VD: Dịch Vụ Giặt Nệm Khử Khuẩn"
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0d4f4a] bg-stone-50/50 font-sans text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Đường Dẫn Slug Cấp 1 (domain.com/slug) *
                </label>
                <div className="flex items-center">
                  <span className="bg-stone-100 px-2.5 py-2.5 text-stone-500 rounded-l-xl border border-r-0 border-stone-300 text-xs">
                    /
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="dich-vu-giat-nem"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-r-xl font-mono text-xs focus:ring-2 focus:ring-[#0d4f4a] bg-stone-50/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* PROMINENT SEO OPTIMIZATION SECTION (ALWAYS OPEN & EXPANDED) */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3.5 shadow-inner">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                  <Globe size={15} className="text-emerald-700" />
                  🎯 Tối Ưu SEO &amp; Thẻ Meta (Google)
                </span>
                <button
                  type="button"
                  onClick={handleAutoFillSeo}
                  className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Sparkles size={11} /> Tự động điền SEO
                </button>
              </div>

              {/* SEO Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-800 text-[11px]">
                    SEO Meta Title (Tiêu đề tìm kiếm) *
                  </label>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    seoTitle.length > 65 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {seoTitle.length}/65 ký tự
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="VD: Dịch Vụ Giặt Nệm Tại Nhà Giá Rẻ | Lười Dọn Nhà"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 font-sans text-xs"
                />
              </div>

              {/* SEO Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-800 text-[11px]">
                    SEO Meta Description (Mô tả snippet) *
                  </label>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    seoDescription.length > 160 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {seoDescription.length}/160 ký tự
                  </span>
                </div>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={2}
                  placeholder="Mô tả hấp dẫn kích thích người dùng click vào liên kết..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 font-sans text-xs leading-relaxed"
                />
              </div>

              {/* OG Image / Thumbnail */}
              <div>
                <label className="block font-bold text-stone-800 text-[11px] mb-1 flex items-center gap-1">
                  <ImageIcon size={13} className="text-emerald-700" />
                  Ảnh Thumbnail Chia Sẻ (OG Image URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://luoidonnha.com/images/landing-banner.jpg"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 text-xs font-mono"
                  />
                  {ogImage && (
                    <img
                      src={ogImage}
                      alt="Thumbnail preview"
                      className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 text-[11px] mb-1">
                    Từ khóa chính (Keywords)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="giặt nệm, vệ sinh sofa, hút bụi"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 text-[11px] mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://luoidonnha.com/slug"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 text-xs font-mono"
                  />
                </div>
              </div>

              {/* NoIndex checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1 bg-white p-2.5 rounded-xl border border-stone-200">
                <input
                  type="checkbox"
                  checked={noIndex}
                  onChange={(e) => setNoIndex(e.target.checked)}
                  className="rounded border-stone-300 text-[#0d4f4a] focus:ring-[#0d4f4a]"
                />
                <span className="font-bold text-stone-700 text-[11px]">
                  Chặn Google Index (noindex / nofollow) cho trang chạy ads
                </span>
              </label>

              {/* SERP Preview */}
              <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider font-mono">
                  Xem trước kết quả tìm kiếm Google (SERP Preview)
                </span>
                <p className="text-sm font-semibold text-blue-700 hover:underline truncate font-sans">
                  {seoTitle || (title ? `${title} | Lười Dọn Nhà` : "Tiêu đề trang Landing Page trên Google")}
                </p>
                <p className="text-[11px] text-emerald-800 truncate font-mono">
                  https://luoidonnha.com/{slug || "slug-landing-page"}
                </p>
                <p className="text-xs text-stone-600 line-clamp-2 font-sans leading-relaxed">
                  {seoDescription || "Đoạn trích mô tả trang landing page trên kết quả tìm kiếm tự nhiên của Google giúp tối ưu CTR và thứ hạng từ khóa."}
                </p>
              </div>
            </div>

            {/* Layout Toggles */}
            <div className="flex gap-4 text-xs font-mono p-3 bg-stone-50 rounded-xl border border-stone-200">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDefaultHeader}
                  onChange={(e) => setUseDefaultHeader(e.target.checked)}
                  className="rounded border-stone-300 text-[#0d4f4a]"
                />
                <span>Hiện Header chung</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDefaultFooter}
                  onChange={(e) => setUseDefaultFooter(e.target.checked)}
                  className="rounded border-stone-300 text-[#0d4f4a]"
                />
                <span>Hiện Footer chung</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
              <span>Tạo Trang Mới &amp; Cấu Hình SEO</span>
            </button>
          </form>
        </div>

        {/* List Pages Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold font-serif text-stone-800 border-b border-stone-100 pb-3">
            Danh Sách Landing Page ({pages.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider bg-stone-50/50">
                  <th className="py-2.5 px-3">Tên Trang</th>
                  <th className="py-2.5 px-3">Slug</th>
                  <th className="py-2.5 px-3">Tối Ưu SEO</th>
                  <th className="py-2.5 px-3 text-right">Studio Kéo Thả / Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-stone-400">
                      Chưa có trang nào. Hãy tạo trang đầu tiên ở khung bên trái!
                    </td>
                  </tr>
                ) : (
                  pages.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900 font-sans text-sm">{p.title}</div>
                        <div className="text-[10px] text-stone-400">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</div>
                      </td>
                      <td className="py-3 px-3">
                        <a
                          href={`https://luoidonnha.com/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                        >
                          /{p.slug} <ExternalLink size={11} />
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        {p.seoTitle ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            ✓ SEO OK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Chưa có SEO
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <Link
                          href={`/admin/pages/${p.id}/builder`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00c9b7] text-[#023835] font-black rounded-lg text-xs hover:bg-[#00b5a4] transition-all shadow-xs"
                        >
                          <Layers size={13} />
                          <span>Mở Studio (Builder)</span>
                        </Link>
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 text-stone-600 hover:text-[#0d4f4a] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Sửa thông tin & SEO"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa trang"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT MODAL WITH PROMINENT SEO */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <Edit2 size={16} className="text-[#0d4f4a]" />
                <span>Chỉnh Sửa Trang &amp; Tối Ưu SEO Meta</span>
              </h3>
              <button
                onClick={() => setEditingPage(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1 uppercase">Tên Trang</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-sans text-sm focus:ring-2 focus:ring-[#0d4f4a]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 uppercase">Slug Cấp 1</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#0d4f4a]"
                  required
                />
              </div>

              {/* SEO Edit Box */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5 uppercase">
                    <Globe size={15} className="text-emerald-700" />
                    Tối Ưu SEO Google &amp; Thẻ Meta
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-800">SEO Title</label>
                    <span className="text-[10px] text-emerald-800 font-bold">{editSeoTitle.length}/65 ký tự</span>
                  </div>
                  <input
                    type="text"
                    value={editSeoTitle}
                    onChange={(e) => setEditSeoTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-sans text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-800">SEO Description</label>
                    <span className="text-[10px] text-emerald-800 font-bold">{editSeoDescription.length}/160 ký tự</span>
                  </div>
                  <textarea
                    value={editSeoDescription}
                    onChange={(e) => setEditSeoDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1 flex items-center gap-1">
                    <ImageIcon size={13} className="text-emerald-700" />
                    Ảnh Thumbnail Chia Sẻ (OG Image URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={editOgImage}
                      onChange={(e) => setEditOgImage(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white font-mono text-xs"
                    />
                    {editOgImage && (
                      <img
                        src={editOgImage}
                        alt="Preview"
                        className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                        onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Từ khóa (Keywords)</label>
                    <input
                      type="text"
                      value={editKeywords}
                      onChange={(e) => setEditKeywords(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Canonical URL</label>
                    <input
                      type="url"
                      value={editCanonicalUrl}
                      onChange={(e) => setEditCanonicalUrl(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white font-mono text-xs"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1 bg-white p-2.5 rounded-xl border border-stone-200">
                  <input
                    type="checkbox"
                    checked={editNoIndex}
                    onChange={(e) => setEditNoIndex(e.target.checked)}
                    className="rounded border-stone-300 text-[#0d4f4a]"
                  />
                  <span className="font-bold text-stone-700">Chặn Google Index (noindex / nofollow)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-[#0d4f4a] text-white font-bold rounded-xl hover:bg-[#083b37] transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {editLoading ? "Đang lưu..." : "Lưu Thay Đổi & Cập Nhật SEO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
