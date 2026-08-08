"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileCode, Plus, Trash2, ExternalLink, Layers, Sparkles } from "lucide-react";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  seoTitle?: string;
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

  // Edit Modal State
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
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
    setSlug(
      val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;
    setLoading(true);

    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, content, useDefaultHeader, useDefaultFooter }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setSlug("");
        setContent("");
        setUseDefaultHeader(true);
        setUseDefaultFooter(true);
        fetchPages();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trang này?")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    fetchPages();
  };

  const handleEditClick = (page: StaticPage) => {
    setEditingPage(page);
    setEditTitle(page.title);
    setEditSlug(page.slug);
    setEditUseHeader(page.useDefaultHeader ?? true);
    setEditUseFooter(page.useDefaultFooter ?? true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/pages/${editingPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: editTitle, 
          slug: editSlug,
          useDefaultHeader: editUseHeader,
          useDefaultFooter: editUseFooter
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

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-[#0d9488]" />
            Quản Lý Trang &amp; UX Builder Studio ({pages.length})
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Thiết kế trang chủ, Landing Page, trang dịch vụ theo phong cách WordPress Visual UX Builder drag/drop.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Page Form */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#0d9488]" />
            Tạo Trang Mới
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tên Trang</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="VD: Trang Chủ, Dịch Vụ, About"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Slug URL Đường Dẫn</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-stone-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả vắn tắt / HTML</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
              />
            </div>
            <div className="space-y-2 py-1 font-mono text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDefaultHeader}
                  onChange={(e) => setUseDefaultHeader(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-[#0d4f4a] focus:ring-[#0d4f4a]"
                />
                <span className="text-stone-700">Dùng Header hệ thống mặc định</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDefaultFooter}
                  onChange={(e) => setUseDefaultFooter(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-[#0d4f4a] focus:ring-[#0d4f4a]"
                />
                <span className="text-stone-700">Dùng Footer hệ thống mặc định</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0d4f4a] text-white font-mono font-bold text-xs rounded-xl hover:bg-[#083b37] transition-colors cursor-pointer shadow-xs"
            >
              {loading ? "Đang lưu..." : "Tạo Trang"}
            </button>
          </form>
        </div>

        {/* Page List with UX Builder Links */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 font-mono">
          <h2 className="text-lg font-bold text-stone-900">Danh Sách Các Trang</h2>
          <div className="divide-y divide-stone-100">
            {pages.length === 0 ? (
              <p className="text-xs text-stone-400 p-4 text-center">Chưa có trang nào.</p>
            ) : (
              pages.map((p) => (
                <div key={p.id} className="py-4 flex items-center justify-between hover:bg-stone-50 px-3 rounded-xl">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      {p.title}
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0d4f4a]/10 text-[#0d4f4a] border border-[#0d4f4a]/30 font-bold uppercase">
                        Published
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">/{p.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/builder/${p.slug}`}
                      className="px-3.5 py-1.5 bg-[#0d4f4a] text-white text-xs font-mono font-bold rounded-xl hover:bg-[#083b37] flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Layers size={14} />
                      <span>🧱 Puck Builder</span>
                    </Link>
                    <a
                      href={`/${p.slug}`}
                      target="_blank"
                      className="p-2 text-stone-500 hover:text-[#0d4f4a] hover:bg-stone-100 rounded-lg"
                      title="Xem trang web"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleEditClick(p)}
                      className="p-2 text-stone-500 hover:text-[#0d9488] hover:bg-stone-100 rounded-lg"
                      title="Sửa thông tin trang"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa trang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Sửa Thông Tin Trang</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tên Trang</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Slug URL</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-stone-50"
                  required
                />
              </div>
              <div className="space-y-2 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editUseHeader}
                    onChange={(e) => setEditUseHeader(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#0d9488] focus:ring-[#0d9488]"
                  />
                  <span className="text-sm text-stone-700">Dùng Header hệ thống mặc định</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editUseFooter}
                    onChange={(e) => setEditUseFooter(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#0d9488] focus:ring-[#0d9488]"
                  />
                  <span className="text-sm text-stone-700">Dùng Footer hệ thống mặc định</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-[#0d9488] text-white text-sm font-medium rounded-lg hover:bg-[#0f766e] transition-colors"
                >
                  {editLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
