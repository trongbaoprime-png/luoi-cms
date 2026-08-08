"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import MediaPickerModal from "@/components/MediaPickerModal";
import ShortcodeSelector from "@/components/ShortcodeSelectorModal";
import {
  Save,
  ArrowLeft,
  Check,
  Eye,
  Edit3,
  FileCode,
  ImageIcon,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  Globe,
  Sliders,
  ExternalLink,
  Sparkles,
} from "lucide-react";

// Dynamically import CKEditor module with ssr: false so ZERO bundle size overhead for public readers!
const CkEditorModule = dynamic(() => import("@/components/CkEditorModule"), {
  ssr: false,
  loading: () => (
    <div className="p-12 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs font-semibold text-stone-400">
      Đang nạp trình soạn thảo CKEditor 5 (Open Source Free Edition)...
    </div>
  ),
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("PUBLISHED");

  // Editor tab mode: "ckeditor" (Full WYSIWYG CKEditor 5) | "visual" (Live Render) | "code" (Raw HTML)
  const [editorTab, setEditorTab] = useState<"ckeditor" | "visual" | "code">("ckeditor");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"cover" | "content">("cover");

  // Rank Math / Yoast SEO Suite State
  const [focusKeyword, setFocusKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [geoLocation, setGeoLocation] = useState("TP. Hồ Chí Minh");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/articles/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([articleRes, catRes]) => {
      if (catRes.success && catRes.data) {
        setCategoriesList(catRes.data);
      }
      if (articleRes.success && articleRes.post) {
        const p = articleRes.post;
        setTitle(p.title);
        setSlug(p.slug);
        setSummary(p.summary || "");
        setContent(p.content || "");
        const cleanContentText = (p.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        let initialSeoTitle = p.seoTitle || p.title || "";
        if (initialSeoTitle.length > 55) {
          initialSeoTitle = initialSeoTitle.slice(0, 52) + "...";
        }

        let initialSeoDesc = p.seoDescription || p.summary || cleanContentText.slice(0, 120);
        if (initialSeoDesc) {
          if (initialSeoDesc.length > 130) {
            initialSeoDesc = initialSeoDesc.slice(0, 125) + "...";
          }
          if (!initialSeoDesc.includes("✓")) {
            initialSeoDesc = `${initialSeoDesc} ✓ Xem ngay tại Lười Dọn Nhà!`;
          }
          if (initialSeoDesc.length > 160) {
            initialSeoDesc = initialSeoDesc.slice(0, 157) + "...";
          }
        }

        setSeoTitle(initialSeoTitle);
        setSeoDesc(initialSeoDesc || "");
        setStatus(p.status || "PUBLISHED");
        if (p.categoryId) setSelectedCategoryId(p.categoryId);
        if (p.schemaJson) {
          try {
            const schemaData = JSON.parse(p.schemaJson);
            if (schemaData.focusKeyword) setFocusKeyword(schemaData.focusKeyword);
            if (schemaData.secondaryKeywords) setSecondaryKeywords(schemaData.secondaryKeywords);
            if (schemaData.geoLocation) setGeoLocation(schemaData.geoLocation);
          } catch {}
        }
      } else {
        alert("Không tìm thấy bài viết!");
        router.push("/admin/articles");
      }
      setLoading(false);
    });
  }, [id, router]);

  // Auto-extract Meta Description from summary/content if empty
  useEffect(() => {
    if (!seoDesc) {
      const cleanContentText = content ? content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
      let baseText = summary || cleanContentText;
      if (baseText) {
        if (baseText.length > 130) {
          baseText = baseText.slice(0, 125) + "...";
        }
        if (!baseText.includes("✓")) {
          baseText = `${baseText} ✓ Xem ngay tại Lười Dọn Nhà!`;
        }
        if (baseText.length > 160) {
          baseText = baseText.slice(0, 157) + "...";
        }
        setSeoDesc(baseText);
      }
    }
  }, [summary, content, seoDesc]);

  const openMediaForContent = () => {
    setMediaTarget("content");
    setIsMediaModalOpen(true);
  };

  const openMediaForCover = () => {
    setMediaTarget("cover");
    setIsMediaModalOpen(true);
  };

  const handleSelectMediaImage = (url: string) => {
    if (mediaTarget === "cover") {
      setCoverImage(url);
    } else {
      const altKeyword = focusKeyword || title || "Hình ảnh bài viết";
      const imgHtml = `<p><img src="${url}" alt="${altKeyword}" loading="lazy" decoding="async" class="rounded-2xl my-4 w-full object-cover shadow-md" /></p>`;
      setContent((prev) => prev + imgHtml);
      if (!coverImage) setCoverImage(url);
      setEditorTab("ckeditor");
    }
  };

  // Helper to format line breaks & paragraphs for clean preview render
  const formatArticleHtmlContent = (rawContent: string): string => {
    if (!rawContent) return "";
    let html = rawContent;
    if (!html.includes("<p>") && !html.includes("<p ") && !html.includes("<div")) {
      html = html
        .split(/\n\n+/)
        .map((para) => `<p class="mb-4 leading-relaxed">${para.trim().replace(/\n/g, "<br />")}</p>`)
        .join("");
    }
    return html;
  };

  const calculateSeoScore = () => {
    let score = 0;
    if (!focusKeyword) return 20;

    const kw = focusKeyword.toLowerCase().trim();
    const t = title.toLowerCase();
    const d = seoDesc.toLowerCase();
    const s = slug.toLowerCase();
    const c = content.toLowerCase();

    if (t.includes(kw)) score += 25;
    if (d.includes(kw)) score += 20;
    if (s.includes(kw.replace(/\s+/g, "-"))) score += 15;
    if (c.slice(0, 300).includes(kw)) score += 15;
    if (c.length > 500) score += 15;
    if (coverImage) score += 10;

    return Math.min(score, 100);
  };

  const seoScore = calculateSeoScore();

  const getH2Headings = () => {
    if (!content) return [];
    const matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
    return matches
      .map((h) => h.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean)
      .slice(0, 3);
  };

  const handleAutoGenerateSeo = () => {
    if (!title) {
      alert("Vui lòng nhập Tiêu đề bài viết trước!");
      return;
    }

    const cleanContentText = content ? content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
    const kw = focusKeyword ? focusKeyword.trim() : "";

    const lowerTitle = title.toLowerCase();
    let intentSuffix = "[Mới Nhất 2026]";
    if (lowerTitle.includes("giá") || lowerTitle.includes("chi phí") || lowerTitle.includes("bao nhiêu")) {
      intentSuffix = "[Bảng Giá 2026]";
    } else if (lowerTitle.includes("mẹo") || lowerTitle.includes("bí quyết") || lowerTitle.includes("cách")) {
      intentSuffix = "[Mẹo Hay 2026]";
    } else if (lowerTitle.includes("là gì") || lowerTitle.includes("hướng dẫn")) {
      intentSuffix = "[Chi Tiết A-Z]";
    }

    let autoTitle = title;
    if (!autoTitle.includes("Lười Dọn Nhà") && !autoTitle.includes("2026")) {
      if ((autoTitle + " " + intentSuffix).length <= 60) {
        autoTitle = `${autoTitle} ${intentSuffix}`;
      } else if ((autoTitle + " - Lười Dọn Nhà").length <= 60) {
        autoTitle = `${autoTitle} - Lười Dọn Nhà`;
      }
    }
    if (autoTitle.length > 60) {
      autoTitle = autoTitle.slice(0, 57) + "...";
    }

    let baseDesc = summary || cleanContentText.slice(0, 110);
    if (kw && !baseDesc.toLowerCase().includes(kw.toLowerCase())) {
      baseDesc = `${kw}: ${baseDesc}`;
    }
    let autoDesc = baseDesc.trim();
    if (autoDesc.length > 120) {
      autoDesc = autoDesc.slice(0, 115) + "...";
    }
    if (!autoDesc.includes("✓")) {
      autoDesc = `${autoDesc} ✓ Xem ngay bí quyết tại Lười Dọn Nhà!`;
    }
    if (autoDesc.length > 160) {
      autoDesc = autoDesc.slice(0, 157) + "...";
    }

    setSeoTitle(autoTitle);
    setSeoDesc(autoDesc);
  };

  const handleUpdate = async (overrideStatus?: string) => {
    if (!title || !content) {
      alert("Vui lòng điền Tiêu đề và Nội dung bài viết!");
      return;
    }

    setSaving(true);
    const targetStatus = overrideStatus || status;
    const selectedCategoryObj = categoriesList.find((c) => c.id === selectedCategoryId);

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          categoryId: selectedCategoryId || undefined,
          categoryName: selectedCategoryObj ? selectedCategoryObj.name : "Mẹo Nhà Gọn",
          summary,
          content,
          coverImage,
          seoTitle,
          seoDesc,
          schemaJson: JSON.stringify({
            focusKeyword,
            secondaryKeywords,
            geoLocation,
            seoScore,
          }),
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus(targetStatus);
        setMsg(`✓ Đã lưu bài viết thành công (${targetStatus === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"})!`);
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Đã xóa bài viết!");
        router.push("/admin/articles");
      }
    } catch {
      alert("Lỗi khi xóa bài viết.");
    }
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      {/* Visual Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={handleSelectMediaImage}
      />

      {/* Top Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm sticky top-2 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-900 font-serif">
                Chỉnh Sửa Bài Viết: {title || "..."}
              </h1>
              {status === "PUBLISHED" ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Published
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase">
                  Draft (Bản Nháp)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 font-mono">
              Trang công khai: /{slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {msg && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 size={14} /> {msg}
            </span>
          )}

          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50 text-[#0d9488] text-xs font-bold hover:bg-teal-100 transition-colors shadow-xs"
            >
              <ExternalLink size={14} />
              <span>Xem bài viết</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
            title="Xóa bài viết"
          >
            <Trash2 size={16} />
          </button>

          {status !== "PUBLISHED" && (
            <button
              type="button"
              onClick={() => handleUpdate("PUBLISHED")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md transition-transform hover:-translate-y-0.5"
            >
              <Sparkles size={14} />
              <span>{saving ? "Đang xuất bản..." : "⚡ XUẤT BẢN NGAY (Publish)"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleUpdate()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d9488] text-white text-xs font-bold hover:bg-[#0f766e] shadow-sm"
          >
            <Save size={14} />
            <span>{saving ? "Đang lưu..." : "Cập Nhật"}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content Area (8 Cols) */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                Tiêu đề bài viết *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 text-lg font-bold font-serif border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Đường dẫn tĩnh (Slug Cấp 1)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-xs border border-stone-300 rounded-xl bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Danh Mục Bài Viết *
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                Tóm tắt bài viết (Summary)
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
              />
            </div>

            {/* WYSIWYG CKEditor 5 Box with Open Source License */}
            <div className="border border-stone-300 rounded-2xl shadow-xs bg-white">
              <div className="bg-stone-100/95 backdrop-blur-md p-2.5 border-b border-stone-300 flex flex-wrap items-center justify-between gap-2 text-xs sticky top-[56px] z-30 rounded-t-2xl shadow-xs">
                <div className="flex bg-white rounded-xl border border-stone-300 p-1">
                  <button
                    type="button"
                    onClick={() => setEditorTab("ckeditor")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      editorTab === "ckeditor" ? "bg-[#0d9488] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Edit3 size={14} /> Soạn thảo bài viết
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("visual")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      editorTab === "visual" ? "bg-[#0d9488] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Eye size={14} /> Xem trước thực tế
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("code")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      editorTab === "code" ? "bg-[#0d9488] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <FileCode size={14} /> Mã HTML
                  </button>
                </div>
              </div>

              {/* Mode 1: CKEditor 5 Open Source Component */}
              {editorTab === "ckeditor" && (
                <CkEditorModule
                  value={content}
                  onChange={(data) => setContent(data)}
                  onOpenMediaPicker={openMediaForContent}
                />
              )}

              {/* Mode 2: Visual Real Preview */}
              {editorTab === "visual" && (
                <div className="p-6 bg-white min-h-[380px] border-t border-stone-100">
                  {content ? (
                    <div
                      className="prose prose-stone max-w-none text-stone-800 text-base leading-relaxed space-y-6 prose-p:my-4 prose-p:leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:font-serif prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-stone-900 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-img:rounded-2xl prose-img:my-6 prose-img:shadow-md prose-img:max-w-full prose-img:h-auto prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4"
                      dangerouslySetInnerHTML={{ __html: formatArticleHtmlContent(content) }}
                    />
                  ) : (
                    <div className="text-center py-16 text-stone-400 font-medium text-xs">
                      Chưa có nội dung. Chuyển sang tab "CKEditor 5 Soạn thảo" để viết bài!
                    </div>
                  )}
                </div>
              )}

              {/* Mode 3: Raw HTML Code Mode */}
              {editorTab === "code" && (
                <textarea
                  rows={18}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<p>Nhập mã HTML tùy chỉnh...</p>"
                  className="w-full p-4 font-mono text-xs bg-stone-900 text-teal-300 leading-relaxed focus:outline-none min-h-[380px]"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Rank Math / Yoast SEO & Thumbnail Picker (4 Cols) */}
        <div className="md:col-span-4 space-y-6">
          {/* Status & Publishing Control Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase text-stone-800 flex items-center justify-between border-b pb-2">
              <span>Trạng Thái &amp; Hiển Thị</span>
              <Sparkles size={14} className="text-[#0d9488]" />
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-600">Trạng Thái Bài Viết:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
              >
                <option value="PUBLISHED">Published (Đã xuất bản - Công khai)</option>
                <option value="DRAFT">Draft (Bản nháp - Chưa công khai)</option>
              </select>
            </div>

            {status === "DRAFT" ? (
              <button
                type="button"
                onClick={() => handleUpdate("PUBLISHED")}
                disabled={saving}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>⚡ XUẤT BẢN BÀI VIẾT NGAY</span>
              </button>
            ) : (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] font-medium text-emerald-800 text-center">
                ✓ Bài viết đang ở trạng thái công khai trên website.
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase text-stone-800 flex items-center justify-between border-b pb-2">
              <span>Ảnh Đại Diện (Thumbnail)</span>
              <ImageIcon size={14} className="text-[#0d9488]" />
            </h3>

            {coverImage ? (
              <div className="space-y-2">
                <div className="w-full h-40 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                  <img src={coverImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="w-full py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                >
                  Xóa ảnh đại diện
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="URL ảnh đại diện..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={openMediaForCover}
                  className="w-full py-2.5 bg-[#0d9488]/10 text-[#0d9488] font-bold text-xs rounded-xl border border-teal-200 hover:bg-[#0d9488]/20 flex items-center justify-center gap-1.5"
                >
                  <ImageIcon size={14} /> + Chọn Ảnh Từ Thư Viện Media
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-xs uppercase text-stone-800 flex items-center gap-1.5">
                <Sliders size={14} className="text-[#0d9488]" /> Rank Math SEO Score
              </h3>
              <span
                className={`px-3 py-1 rounded-full font-mono text-xs font-black text-white ${
                  seoScore >= 80 ? "bg-emerald-600" : seoScore >= 50 ? "bg-amber-500" : "bg-rose-600"
                }`}
              >
                {seoScore} / 100
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Từ khóa chính (Focus Keyword) *
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="VD: robot hut bui"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Từ khóa phụ (Secondary Keywords)
                </label>
                <input
                  type="text"
                  placeholder="dịch vụ lau dọn, nhà sạch tự động..."
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <MapPin size={12} className="text-rose-500" /> Định vị GEO SEO (Tỉnh/Thành)
                </label>
                <select
                  value={geoLocation}
                  onChange={(e) => setGeoLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-semibold"
                >
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Toàn Quốc">Toàn Quốc (Việt Nam)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t space-y-2 text-xs">
              <h4 className="font-bold text-stone-800 text-[11px] uppercase">Rank Math Checklist:</h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  {title.toLowerCase().includes((focusKeyword || "___").toLowerCase()) ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <XCircle size={14} className="text-stone-300" />
                  )}
                  <span>Từ khóa chính trong Tiêu đề</span>
                </div>
                <div className="flex items-center gap-2">
                  {seoDesc.toLowerCase().includes((focusKeyword || "___").toLowerCase()) ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <XCircle size={14} className="text-stone-300" />
                  )}
                  <span>Từ khóa chính trong Meta Description</span>
                </div>
                <div className="flex items-center gap-2">
                  {slug.toLowerCase().includes((focusKeyword || "___").toLowerCase().replace(/\s+/g, "-")) ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <XCircle size={14} className="text-stone-300" />
                  )}
                  <span>Từ khóa chính trong URL Slug</span>
                </div>
                <div className="flex items-center gap-2">
                  {content.length > 500 ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <XCircle size={14} className="text-stone-300" />
                  )}
                  <span>Nội dung bài viết &gt; 500 ký tự</span>
                </div>
                <div className="flex items-center gap-2">
                  {coverImage ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <XCircle size={14} className="text-stone-300" />
                  )}
                  <span>Có Ảnh Đại Diện (Thumbnail)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-800 text-[11px] uppercase flex items-center gap-1">
                  <Globe size={13} className="text-[#0d9488]" /> SERP LIVE PREVIEW (GOOGLE):
                </h4>
                <button
                  type="button"
                  onClick={handleAutoGenerateSeo}
                  className="px-2.5 py-1 bg-teal-50 text-[#0d9488] hover:bg-teal-100 font-bold text-[10px] rounded-lg border border-teal-200 flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Sparkles size={12} /> Tối ưu CTR Tự động
                </button>
              </div>

              {/* Simulated Google Search Result Card */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm font-sans text-left space-y-2 relative overflow-hidden">
                {/* Site Identity Line */}
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <span className="w-5 h-5 rounded-full bg-[#0d9488] text-white flex items-center justify-center font-bold text-[10px]">
                    L
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[11px] leading-none text-stone-900">LƯỜI DỌN NHÀ</span>
                    <span className="text-[10px] text-stone-500 font-mono leading-tight truncate max-w-[220px]">
                      https://luoidonnha.com &gt; {slug || "slug-bai-viet"}
                    </span>
                  </div>
                </div>

                {/* Title & Side Thumbnail Grid */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="text-sm md:text-base font-bold text-[#1a0dab] hover:underline leading-snug cursor-pointer line-clamp-2">
                      {seoTitle || title || "Tiêu đề bài viết hiển thị trên Google..."}
                    </div>
                    <div className="text-[11px] text-[#4d5156] leading-relaxed line-clamp-3">
                      <span className="font-semibold text-stone-500">01/08/2026 — </span>
                      {seoDesc || summary || "Mô tả ngắn hiển thị thu hút người dùng bấm vào trên Google Search..."}
                    </div>
                  </div>

                  {coverImage && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 shadow-2xs">
                      <img src={coverImage} alt="Snippet thumbnail" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Sitelink Pills / People Also Ask Buttons */}
                {getH2Headings().length > 0 && (
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5">
                    {getH2Headings().map((h2, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-stone-100 text-stone-700 text-[10px] font-semibold rounded-full border border-stone-200 truncate max-w-[150px]"
                      >
                        {h2}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Editable Inputs & Realtime Character Counters */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-stone-700">Meta Title (50-60 ký tự)</label>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        seoTitle.length >= 40 && seoTitle.length <= 60
                          ? "text-emerald-600"
                          : seoTitle.length > 60
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {seoTitle.length} / 60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Nhập tiêu đề Meta chuẩn SEO..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-stone-700">Meta Description (140-160 ký tự)</label>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        seoDesc.length >= 120 && seoDesc.length <= 160
                          ? "text-emerald-600"
                          : seoDesc.length > 160
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {seoDesc.length} / 160
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    placeholder="Nhập mô tả Meta thu hút CTR..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
