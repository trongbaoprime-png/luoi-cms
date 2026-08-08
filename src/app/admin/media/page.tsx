"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Image as ImageIcon, Copy, Check, Trash2, Loader2 } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchMedia = () => {
    fetch("/api/media")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMediaList(data.data);
      });
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMsg(`Đang tải ${files.length} file lên server...`);

    const fileArray = Array.from(files);
    let successCount = 0;

    try {
      await Promise.all(
        fileArray.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/media/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.success) successCount++;
        })
      );

      if (successCount > 0) {
        setMsg(`✓ Đã tải ${successCount}/${fileArray.length} ảnh thành công!`);
        fetchMedia();
      } else {
        setMsg("Lỗi tải các file.");
      }
    } catch {
      setMsg("Lỗi kết nối server.");
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa file ảnh này?")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    fetchMedia();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-[#0d9488]" />
          Thư Viện Media ({mediaList.length})
        </h1>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${msg.includes("✓") ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          <span>{msg}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        {/* Hidden File Input */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        {/* Drag & Drop Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-[#0d9488] transition-colors cursor-pointer mb-6 bg-stone-50/50 hover:bg-stone-50"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#0d9488] animate-spin mb-2" />
              <p className="text-sm font-medium text-stone-700">Đang lưu file vào server...</p>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-700">Click hoặc Kéo thả file ảnh vào đây để Tải Lên</p>
              <p className="text-xs text-stone-400 mt-1">Hỗ trợ PNG, JPG, WebP, SVG (Tối đa 10MB)</p>
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaList.map((item) => (
            <div key={item.id} className="group border rounded-lg p-2 bg-stone-50 hover:shadow-md transition-all">
              <div className="h-32 bg-stone-200 rounded overflow-hidden mb-2 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-semibold truncate text-stone-800" title={item.filename}>{item.filename}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-stone-500">
                <span>{(item.size / 1024).toFixed(1)} KB</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(item.url, item.id)}
                    className="p-1 hover:text-[#0d9488] transition-colors flex items-center gap-1"
                    title="Copy Link"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
