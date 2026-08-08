"use client";

import { useState, useEffect } from "react";
import { FolderPlus, Trash2, Tag, Layers, Edit2, Search, CheckCircle2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { posts: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
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
      setSlug(
        val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
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
        body: JSON.stringify({ name, slug, description }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg(editingId ? "✓ Đã cập nhật danh mục!" : "✓ Đã thêm danh mục mới!");
        cancelEdit();
        fetchCategories();
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
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
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#0d9488]" />
          Quản Lý Danh Mục Taxonomy ({categories.length})
        </h1>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Form */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#0d9488]" />
            {editingId ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tên Danh Mục</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="VD: Đồ Dùng Bếp"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Slug Cấp 1 (domain.com/slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-stone-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] font-mono text-xs"
              />
            </div>
            <div className="flex gap-2 font-mono">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-[#0d4f4a] text-white font-bold text-xs rounded-xl hover:bg-[#083b37] transition-colors shadow-xs cursor-pointer"
              >
                {loading ? "Đang lưu..." : editingId ? "Cập Nhật" : "Thêm Danh Mục"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2.5 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-50 cursor-pointer"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Category List */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-800">Danh Sách Danh Mục</h2>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm danh mục..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
              />
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="py-3 flex items-center justify-between hover:bg-stone-50 px-2 rounded-lg">
                <div>
                  <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#0d9488]" />
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2.5 py-1 bg-stone-100 rounded-full text-stone-600">
                    {cat._count?.posts || 0} bài viết
                  </span>
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1.5 text-stone-600 hover:text-[#0d9488] hover:bg-stone-100 rounded-lg"
                    title="Sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
