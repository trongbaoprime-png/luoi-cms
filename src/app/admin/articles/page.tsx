"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FileText, ExternalLink, Trash2, Edit3 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  seoDescription?: string;
  focusKeyword?: string;
  content?: string;
  coverImage?: string;
  views: number;
  status: string;
  createdAt: string;
  category?: { name: string; slug: string };
}

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchArticles = () => {
    setLoading(true);
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.posts) {
          setArticles(data.posts);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    fetchArticles();
  };

  const handleToggleStatus = async (item: Article) => {
    const nextStatus = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await fetch(`/api/articles/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          slug: item.slug,
          status: nextStatus,
        }),
      });
      fetchArticles();
    } catch {
      alert("Lỗi đổi trạng thái bài viết.");
    }
  };

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || art.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Quản Lý Bài Viết ({articles.length})</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Quản trị bài viết blog chuẩn SEO, tự động chèn Schema.org &amp; Pre-render tốc độ cao.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d4f4a] text-white text-xs font-mono font-bold hover:bg-[#083b37] transition-colors shadow-xs"
        >
          <Plus size={16} />
          <span>Soạn bài mới</span>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 font-mono">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm bài viết theo từ khóa, tiêu đề, slug..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-stone-300 rounded-xl text-stone-700 font-mono font-bold"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PUBLISHED">Đã xuất bản (Published)</option>
          <option value="DRAFT">Lưu nháp (Draft)</option>
        </select>
      </div>

      {/* Articles Data Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-stone-500 font-mono font-medium">Đang nạp danh sách bài viết từ database...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center text-stone-400 font-mono">Không tìm thấy bài viết nào phù hợp.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-xs font-mono font-bold uppercase text-stone-700">
                <th className="py-3.5 px-4">Bài viết</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">🎯 Điểm SEO Google</th>
                <th className="py-3.5 px-4">Lượt xem</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs font-mono">
              {filteredArticles.map((item) => {
                // Calculate Google-standard SEO Score (0 - 100 points)
                let seoScore = 0;

                if (item.title && item.title.length >= 35 && item.title.length <= 70) seoScore += 15;
                else if (item.title && item.title.length > 20) seoScore += 8;

                const metaDesc = item.summary || item.seoDescription || "";
                if (metaDesc.length >= 100 && metaDesc.length <= 165) seoScore += 15;
                else if (metaDesc.length > 30) seoScore += 7;

                if (item.slug && item.slug.length >= 10 && item.slug.length <= 80 && !item.slug.includes("_")) seoScore += 10;

                const keyword = (item.focusKeyword || "").toLowerCase().trim();
                if (keyword && item.title.toLowerCase().includes(keyword)) seoScore += 15;
                else if (!keyword && item.title.length >= 30) seoScore += 6;

                if (keyword && metaDesc.toLowerCase().includes(keyword)) seoScore += 10;
                if (item.category?.name) seoScore += 10;

                const wordCount = (item.content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
                if (wordCount >= 500) seoScore += 15;
                else if (wordCount >= 200) seoScore += 8;
                if (item.coverImage) seoScore += 10;

                const scoreLabel = seoScore >= 80 ? "Chuẩn Google" : seoScore >= 60 ? "Tốt" : seoScore >= 40 ? "Cần Tối Ưu" : "Yếu";
                const scoreColor = seoScore >= 60 ? "bg-[#0d4f4a]/10 text-[#0d4f4a] border-[#0d4f4a]/30" : "bg-[#f7f4ed] text-[#5c564f] border-[#d8d2c2]";

                return (
                  <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-4 text-stone-900">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#0d4f4a] shrink-0" />
                        <span className="line-clamp-1 font-bold">{item.title}</span>
                      </div>
                      <span className="text-xs text-stone-400 font-mono block mt-0.5">/{item.slug}</span>
                    </td>
                    <td className="py-4 px-4 text-stone-600">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs font-bold">
                        {item.category?.name || "Chưa phân loại"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${scoreColor}`}
                      >
                        {seoScore}/100 {scoreLabel}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs font-bold text-[#0d4f4a]">
                      {(item.views || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        title="Bấm để chuyển trạng thái Xuất Bản / Lưu Nháp"
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        {item.status === "PUBLISHED" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#0d4f4a]/10 text-[#0d4f4a] border border-[#0d4f4a]/30 text-xs font-bold shadow-2xs font-mono">
                            ✓ Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#f7f4ed] text-[#5c564f] border border-[#d8d2c2] text-xs font-bold shadow-2xs font-mono">
                            ⚡ Draft
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/articles/${item.id}/edit`}
                        className="p-1.5 text-stone-600 hover:text-[#0d9488] rounded-md hover:bg-stone-100"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <Link
                        href={`/${item.slug}`}
                        target="_blank"
                        className="p-1.5 text-stone-600 hover:text-blue-600 rounded-md hover:bg-stone-100"
                        title="Xem live"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
