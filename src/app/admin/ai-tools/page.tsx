"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Bot, Zap, Image as ImageIcon, HelpCircle, KeyRound, Layers } from "lucide-react";
import { generateContextualImages } from "@/lib/ai-service";

export default function AIToolsPage() {
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<"OUTLINE" | "SEO_META" | "FULL_DRAFT" | "EEAT_FAQ" | "KEYWORD_IDEAS">("FULL_DRAFT");
  const [apiKey, setApiKey] = useState("");
  const [output, setOutput] = useState("");
  const [generatedImages, setGeneratedImages] = useState<{ featuredImage: { url: string; alt: string }; bodyImages: { url: string; alt: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) {
      alert("Vui lòng nhập Chủ đề!");
      return;
    }
    setLoading(true);
    setOutput("");
    setGeneratedImages(null);

    try {
      // 1. Generate text content
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, prompt, type, apiKey })
      });

      const data = await res.json();
      if (data.success && data.content) {
        setOutput(data.content);
        
        // 2. Generate contextual images with descriptive ALT tags
        const imgs = generateContextualImages(topic);
        setGeneratedImages(imgs);
        setGeneratedImages(imgs);
      } else {
        setOutput(
          "⚠️ Thông báo: API Key nhập vào chưa chính xác hoặc hết hạn quota. Hệ thống đã tự động chuyển sang chế độ AI Nội Dung Tiêu Chuẩn (Built-in E-E-A-T Engine).\n\n" +
            (data.content || "Chủ đề: " + topic + "\n\nNội dung đang được khởi tạo chuẩn SEO E-E-A-T...")
        );
      }
    } catch {
      setOutput("⚠️ Đã xảy ra lỗi kết nối. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#0f172a] flex items-center gap-2">
            <Bot className="text-[#d97706]" size={26} />
            <span>AI Content Engine Pro (E-E-A-T &amp; Auto FAQ &amp; Image Pipeline)</span>
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Văn phong diễn đạt như người thật 100%, tự động hóa FAQ Schema.org, tạo ảnh đại diện + ảnh bài viết kèm ALT chuẩn SEO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-xs font-bold text-[#059669]">
            <Sparkles size={14} /> E-E-A-T Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Settings Form */}
        <div className="md:col-span-5 bg-white p-6 rounded-xl border border-[#e2e8f0] space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#475569] mb-1">
              Chủ đề / Từ khóa chính *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Mẹo sắp xếp phòng bếp nhỏ gọn 5 phút"
              className="w-full px-3 py-2 text-sm border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#d97706]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#475569] mb-1">
              Loại khởi tạo AI
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-2 text-sm border border-[#cbd5e1] rounded-lg font-medium"
            >
              <option value="FULL_DRAFT">✨ Bản nháp bài viết E-E-A-T (Văn phong người thật 100%)</option>
              <option value="EEAT_FAQ">❓ Tự động hóa FAQ &amp; Schema JSON-LD FAQPage</option>
              <option value="KEYWORD_IDEAS">💡 Gợi ý Chủ đề &amp; Từ khóa ngách (Long-tail)</option>
              <option value="SEO_META">🔍 Tiêu đề SEO &amp; Meta Description</option>
              <option value="OUTLINE">📋 Dàn ý bài viết 2000-5000 từ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#475569] mb-1">
              Yêu cầu văn phong &amp; Prompt bổ sung
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Góc nhìn tác giả trải nghiệm thực tế, giọng văn thân thiện, có ví dụ cụ thể..."
              className="w-full p-3 text-xs border border-[#cbd5e1] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#475569] mb-1">
              API Key (Gemini 1.5 Pro / OpenAI)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... hoặc sk-..."
              className="w-full p-2 font-mono text-xs border border-[#cbd5e1] rounded-lg"
            />
            <span className="text-[11px] text-[#64748b] block mt-1">Lưu trữ bảo mật trong phiên làm việc.</span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-bold text-sm hover:opacity-95 transition-all shadow-md"
          >
            <Sparkles size={18} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "AI đang khởi tạo nội dung E-E-A-T..." : "TẠO NỘI DUNG 1-CLICK"}</span>
          </button>
        </div>

        {/* Right Column: AI Output & Contextual Images */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Generated Contextual Images Box */}
          {generatedImages && (
            <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-mono text-xs font-bold uppercase text-[#0d9488] flex items-center gap-1.5">
                  <ImageIcon size={16} /> Tự Động Tạo Ảnh Bài Viết &amp; Thẻ ALT Chuẩn SEO
                </span>
                <span className="text-[10px] bg-[#ccfbf1] text-[#0f766e] px-2 py-0.5 rounded-full font-bold">
                  Tối ưu giữ chân người đọc
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Featured Image */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#475569] block">Ảnh Đại Diện (Featured):</span>
                  <div className="relative rounded-lg overflow-hidden border border-[#cbd5e1] bg-[#f8fafc] aspect-video">
                    <img src={generatedImages.featuredImage.url} alt={generatedImages.featuredImage.alt} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-[#64748b] truncate" title={generatedImages.featuredImage.alt}>
                    <strong className="text-[#0d9488]">ALT:</strong> {generatedImages.featuredImage.alt}
                  </p>
                </div>

                {/* Body Image */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#475569] block">Ảnh Minh Họa Nội Dung:</span>
                  <div className="relative rounded-lg overflow-hidden border border-[#cbd5e1] bg-[#f8fafc] aspect-video">
                    <img src={generatedImages.bodyImages[0].url} alt={generatedImages.bodyImages[0].alt} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-[#64748b] truncate" title={generatedImages.bodyImages[0].alt}>
                    <strong className="text-[#0d9488]">ALT:</strong> {generatedImages.bodyImages[0].alt}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Output Window */}
          <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <span className="font-mono text-xs font-bold uppercase text-[#475569] flex items-center gap-2">
                  <Zap size={16} className="text-[#d97706]" /> Kết Quả Trả Về Từ AI Engine
                </span>
                {output && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-medium text-[#334155]"
                  >
                    {copied ? <Check size={14} className="text-[#16a34a]" /> : <Copy size={14} />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                )}
              </div>

              {output ? (
                <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-[#1e293b] max-h-[500px] overflow-y-auto p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  {output}
                </pre>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-[#94a3b8]">
                  <Bot size={44} className="mb-2 opacity-40 text-[#d97706]" />
                  <p className="text-sm font-medium text-[#64748b]">Nhập chủ đề và bấm &quot;TẠO NỘI DUNG 1-CLICK&quot; để trợ lý AI bắt đầu khởi tạo bài viết chuẩn E-E-A-T.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
