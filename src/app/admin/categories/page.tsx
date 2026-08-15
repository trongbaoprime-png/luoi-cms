"use client";

import { useState, useEffect } from "react";
import { FolderPlus, Trash2, Tag, Layers, Edit2, Search, CheckCircle2, Globe, Sparkles, Image as ImageIcon, ExternalLink, RefreshCw } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  schemaJson?: string;
  _count?: { posts: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  
  // SEO Fields (Always visible & prominent)
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchCategories = () => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generatedSlug);
      if (!seoTitle) {
        setSeoTitle(`${val} - Chuyên mục | Tâm Đức Smile`);
      }
      if (!canonicalUrl) {
        setCanonicalUrl(`https://tamduc.vn/${generatedSlug}`);
      }
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setSeoTitle(cat.seoTitle || `${cat.name} - Chuyên mục | Tâm Đức Smile`);
    setSeoDescription(cat.seoDescription || cat.description || "");
    setOgImage(cat.ogImage || "");
    setCanonicalUrl(cat.canonicalUrl || `https://tamduc.vn/${cat.slug}`);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setSeoTitle("");
    setSeoDescription("");
    setOgImage("");
    setCanonicalUrl("");
  };

  const handleAutoFillSeo = () => {
    if (!name) return;
    setSeoTitle(`${name} - Cập nhật mới nhất 2026 | Tâm Đức Smile`);
    if (description) {
      setSeoDescription(description.slice(0, 155));
    } else {
      setSeoDescription(`Tổng hợp các bài viết, cẩm nang và sản phẩm hàng đầu thuộc chuyên mục ${name} tại Tâm Đức Smile.`);
    }
    if (slug) {
      setCanonicalUrl(`https://tamduc.vn/${slug}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setLoading(true);

    try {
      const endpoint = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: description || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          ogImage: ogImage || null,
          canonicalUrl: canonicalUrl || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg(editingId ? "✓ Đã cập nhật danh mục & tối ưu SEO thành công!" : "✓ Đã thêm danh mục mới & cấu hình SEO chuẩn Google!");
        cancelEdit();
        fetchCategories();
      } else {
        const errMsg = data.error || "Lỗi không xác định";
        setMsg("❌ Lỗi: " + errMsg);
        alert("Thao tác thất bại!\n\n" + errMsg);
      }
    } catch (e: any) {
      const errMsg = e?.message || "Lỗi kết nối server";
      setMsg("❌ " + errMsg);
      alert("Lỗi kết nối: " + errMsg);
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.seoTitle && c.seoTitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#0d4f4a]" />
            <span>Quản Lý Danh Mục &amp; Tối Ưu SEO Taxonomy ({categories.length})</span>
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Cấu hình danh mục cấp 1, tối ưu Meta SEO Title, SEO Description, Thumbnail OpenGraph &amp; Schema.org CollectionPage.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-mono flex items-center gap-2 border border-emerald-200 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Category Details & SEO Optimization (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-base font-bold font-serif text-stone-800 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#0d4f4a]" />
              <span>{editingId ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}</span>
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs text-stone-500 hover:text-stone-800 font-mono underline cursor-pointer"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Tên Danh Mục *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="VD: Dịch Vụ Vệ Sinh Nhà Cửa"
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0d4f4a] bg-stone-50/50 font-sans text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1 uppercase tracking-wider">
                    Đường Dẫn Slug Cấp 1 *
                  </label>
                  <div className="flex items-center">
                    <span className="bg-stone-100 px-2.5 py-2.5 text-stone-500 rounded-l-xl border border-r-0 border-stone-300 text-xs">
                      /
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="dich-vu-ve-sinh"
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-r-xl font-mono text-xs focus:ring-2 focus:ring-[#0d4f4a] bg-stone-50/50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Mô Tả Chuyên Mục
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Giới thiệu khái quát về nội dung chuyên mục này..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0d4f4a] text-xs font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* PROMINENT SEO OPTIMIZATION CARD (ALWAYS OPEN) */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3.5 shadow-inner">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                  <Globe size={15} className="text-emerald-700" />
                  🎯 Tối Ưu SEO Google &amp; Thẻ Meta (Bắt buộc)
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
                  placeholder="VD: Dịch Vụ Vệ Sinh Căn Hộ Chuyên Nghiệp | Tâm Đức Smile"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 font-sans text-xs"
                />
              </div>

              {/* SEO Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-800 text-[11px]">
                    SEO Meta Description (Đoạn trích mô tả) *
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
                  placeholder="Mô tả cuốn hút xuất hiện dưới kết quả tìm kiếm Google..."
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
                    placeholder="https://tamduc.vn/images/category-banner.jpg"
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

              {/* Canonical URL */}
              <div>
                <label className="block font-bold text-stone-800 text-[11px] mb-1">
                  Canonical URL (Liên kết chuẩn SEO)
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://tamduc.vn/dich-vu-ve-sinh"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 text-xs font-mono"
                />
              </div>

              {/* SERP Google Live Preview */}
              <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider font-mono">
                  Xem trước kết quả tìm kiếm Google (SERP Preview)
                </span>
                <p className="text-sm font-semibold text-blue-700 hover:underline truncate font-sans">
                  {seoTitle || (name ? `${name} - Chuyên mục | Tâm Đức Smile` : "Tiêu đề danh mục trên Google Search")}
                </p>
                <p className="text-[11px] text-emerald-800 truncate font-mono">
                  https://tamduc.vn/{slug || "slug-danh-muc"}
                </p>
                <p className="text-xs text-stone-600 line-clamp-2 font-sans leading-relaxed">
                  {seoDescription || description || "Đoạn trích giới thiệu danh mục xuất hiện trên Google Tìm Kiếm giúp gia tăng CTR và thứ hạng từ khóa."}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <FolderPlus size={15} />}
              <span>{editingId ? "Cập Nhật Danh Mục & Lưu SEO" : "Thêm Danh Mục & Lưu SEO"}</span>
            </button>
          </form>
        </div>

        {/* Right Table: Category List with SEO Badge (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <h2 className="text-base font-bold font-serif text-stone-800">
              Danh Sách Danh Mục ({filteredCategories.length})
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm danh mục..."
                className="w-full pl-9 pr-3 py-1.5 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0d4f4a] font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider bg-stone-50/50">
                  <th className="py-2.5 px-3">Danh Mục</th>
                  <th className="py-2.5 px-3">Slug Cấp 1</th>
                  <th className="py-2.5 px-3">Tối Ưu SEO</th>
                  <th className="py-2.5 px-3">Bài Viết</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400">
                      Chưa có danh mục nào. Hãy tạo danh mục đầu tiên ở khung bên trái!
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900 font-sans text-sm">{cat.name}</div>
                        {cat.description && (
                          <div className="text-[11px] text-stone-500 font-sans line-clamp-1 max-w-xs">{cat.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <a
                          href={`https://tamduc.vn/${cat.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                        >
                          /{cat.slug} <ExternalLink size={11} />
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        {cat.seoTitle ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            ✓ SEO OK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Chưa có SEO
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-700">
                        {cat._count?.posts || 0} bài
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 text-stone-600 hover:text-[#0d4f4a] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa danh mục & SEO"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa danh mục"
                        >
                          <Trash2 size={15} />
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
    </div>
  );
}
