"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Trash2, ExternalLink, Star, Edit3, X, Check, Search, TrendingUp } from "lucide-react";

interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  rating: number;
  merchant: string;
  affiliateUrl: string;
  clicks: number;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  pros?: string;
  cons?: string;
  categoryId?: string;
}

const EMPTY_FORM: Partial<Product> = {
  title: "",
  slug: "",
  description: "",
  price: undefined,
  originalPrice: undefined,
  image: "",
  rating: 5.0,
  merchant: "Shopee",
  affiliateUrl: "",
  isFeatured: false,
  pros: "",
  cons: "",
  seoTitle: "",
  seoDescription: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>(EMPTY_FORM);

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const slugify = (val: string) =>
    val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (prod: Product) => {
    setEditingId(prod.id);
    setForm({ ...prod });
    setShowModal(true);
  };

  const handleFormChange = (key: keyof Product, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "title" && !editingId) {
        updated.slug = `${slugify(value)}-${Date.now().toString().slice(-4)}`;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.affiliateUrl) return;
    setLoading(true);

    const payload = {
      ...form,
      price: form.price ? Number(form.price) : undefined,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      rating: Number(form.rating) || 5.0,
      slug: form.slug || `${slugify(form.title || "product")}-${Date.now().toString().slice(-4)}`,
    };

    try {
      const endpoint = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMsg(editingId ? "✓ Đã cập nhật sản phẩm!" : "✓ Đã thêm sản phẩm mới!");
        setShowModal(false);
        setForm(EMPTY_FORM);
        setEditingId(null);
        fetchProducts();
      } else {
        setMsg("⚠ Có lỗi xảy ra: " + (data.error || "Vui lòng thử lại"));
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.merchant.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#0d4f4a]" />
            Quản Lý Sản Phẩm Affiliate ({products.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Shopee, Lazada, Tiki – Quản lý đầy đủ thông tin, giá, ảnh, SEO sản phẩm affiliate.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d4f4a] text-white text-xs font-mono font-bold hover:bg-[#083b37] transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={16} />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Success / Error message */}
      {msg && (
        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 font-medium ${msg.startsWith("✓") ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          <Check size={16} />
          {msg}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-stone-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm theo tên hoặc sàn..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((prod) => (
          <div key={prod.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            {/* Image */}
            {prod.image ? (
              <div className="h-40 overflow-hidden bg-stone-100">
                <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-40 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                <ShoppingBag size={32} className="text-stone-300" />
              </div>
            )}

            {/* Info */}
            <div className="p-4 flex flex-col flex-1 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ccfbf1] text-[#0d9488] rounded-full">
                  {prod.merchant}
                </span>
                {prod.isFeatured && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-0.5">
                    <TrendingUp size={9} /> HOT
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 flex-1">
                {prod.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={11} className="fill-current" /> {prod.rating}
                </span>
                <span className="font-mono text-[#0d9488]">{prod.clicks} clicks</span>
              </div>

              {prod.price && (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-[#0d9488] text-sm">
                    {prod.price.toLocaleString("vi-VN")}đ
                  </span>
                  {prod.originalPrice && prod.originalPrice > prod.price && (
                    <span className="text-xs line-through text-stone-400">
                      {prod.originalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => openEdit(prod)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-[#0d9488] bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Edit3 size={13} /> Chỉnh sửa
                </button>
                <a
                  href={prod.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-stone-500 hover:text-[#0d9488] hover:bg-stone-100 rounded-lg transition-colors"
                  title="Xem link affiliate"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => handleDelete(prod.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
            {search ? "Không tìm thấy sản phẩm phù hợp." : "Chưa có sản phẩm. Nhấn \"Thêm sản phẩm mới\" để bắt đầu!"}
          </div>
        )}
      </div>

      {/* ======= Add/Edit Product Modal ======= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  {editingId ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Điền đầy đủ thông tin để hiển thị tốt trên website và SEO
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setEditingId(null); }}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Tên Sản Phẩm *
                  </label>
                  <input
                    type="text"
                    value={form.title || ""}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="VD: Cây lau nhà tự vắt 360°"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Sàn Thương Mại
                  </label>
                  <select
                    value={form.merchant || "Shopee"}
                    onChange={(e) => handleFormChange("merchant", e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-sm"
                  >
                    <option value="Shopee">Shopee</option>
                    <option value="Lazada">Lazada</option>
                    <option value="Tiki">Tiki</option>
                    <option value="Amazon">Amazon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Đánh Giá (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.rating || 5.0}
                    onChange={(e) => handleFormChange("rating", parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-sm"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Giá Bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) => handleFormChange("price", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="199000"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Giá Gốc (Cũ)
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice || ""}
                    onChange={(e) => handleFormChange("originalPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="299000"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-sm"
                  />
                </div>
              </div>

              {/* Links */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Link Affiliate *
                </label>
                <input
                  type="url"
                  value={form.affiliateUrl || ""}
                  onChange={(e) => handleFormChange("affiliateUrl", e.target.value)}
                  placeholder="https://shopee.vn/..."
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  URL Ảnh Sản Phẩm
                </label>
                <input
                  type="text"
                  value={form.image || ""}
                  onChange={(e) => handleFormChange("image", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-sm font-mono"
                />
                {form.image && (
                  <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-stone-200">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Mô Tả Sản Phẩm
                </label>
                <textarea
                  rows={3}
                  value={form.description || ""}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Mô tả ngắn gọn về sản phẩm..."
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-sm"
                />
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Ưu Điểm (Pros)
                  </label>
                  <textarea
                    rows={3}
                    value={form.pros || ""}
                    onChange={(e) => handleFormChange("pros", e.target.value)}
                    placeholder="Mỗi ưu điểm một dòng..."
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Nhược Điểm (Cons)
                  </label>
                  <textarea
                    rows={3}
                    value={form.cons || ""}
                    onChange={(e) => handleFormChange("cons", e.target.value)}
                    placeholder="Mỗi nhược điểm một dòng..."
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488] text-xs"
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-stone-600 flex items-center gap-1.5">
                  <span className="w-4 h-4 bg-[#0d9488] text-white rounded text-[9px] flex items-center justify-center font-black">S</span>
                  SEO Meta
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    SEO Title (dưới 60 ký tự)
                  </label>
                  <input
                    type="text"
                    value={form.seoTitle || ""}
                    onChange={(e) => handleFormChange("seoTitle", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    maxLength={70}
                  />
                  <span className={`text-[10px] font-mono ${(form.seoTitle?.length || 0) > 60 ? "text-rose-500" : "text-stone-400"}`}>
                    {form.seoTitle?.length || 0}/60
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Meta Description (dưới 160 ký tự)
                  </label>
                  <textarea
                    rows={2}
                    value={form.seoDescription || ""}
                    onChange={(e) => handleFormChange("seoDescription", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    maxLength={170}
                  />
                  <span className={`text-[10px] font-mono ${(form.seoDescription?.length || 0) > 160 ? "text-rose-500" : "text-stone-400"}`}>
                    {form.seoDescription?.length || 0}/160
                  </span>
                </div>
              </div>

              {/* Featured Toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isFeatured || false}
                  onChange={(e) => handleFormChange("isFeatured", e.target.checked)}
                  className="w-4 h-4 text-[#0d9488] rounded"
                />
                <div>
                  <span className="text-sm font-bold text-stone-800">Sản phẩm nổi bật (HOT)</span>
                  <p className="text-xs text-stone-500">Hiển thị badge HOT, ưu tiên xếp hạng cao nhất trong danh sách</p>
                </div>
              </label>

              {/* Footer Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-stone-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-mono font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {loading ? "Đang lưu..." : editingId ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setEditingId(null); }}
                  className="px-5 py-3 border border-stone-300 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
