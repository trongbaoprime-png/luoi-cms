"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, Check, Loader2, Search } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

// Default high quality preset images for cleaning & smart appliances
const PRESET_IMAGES: MediaItem[] = [
  {
    id: "preset-1",
    filename: "robot-hut-bui-thong-minh.jpg",
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "preset-2",
    filename: "phong-khach-sach-se.jpg",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "preset-3",
    filename: "thiet-bi-gia-dung.jpg",
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "preset-4",
    filename: "can-ho-hien-dai.jpg",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "preset-5",
    filename: "may-lau-nha-tu-dong.jpg",
    url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "preset-6",
    filename: "phong-ngu-toi-gian.jpg",
    url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function MediaPickerModal({ isOpen, onClose, onSelectImage }: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchMedia = () => {
    fetch("/api/media")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setMediaList([...data.data, ...PRESET_IMAGES]);
        } else {
          setMediaList(PRESET_IMAGES);
        }
      })
      .catch(() => setMediaList(PRESET_IMAGES));
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMsg(`Đang tải ${files.length} hình ảnh lên server...`);

    const fileArray = Array.from(files);
    let successCount = 0;
    let lastUrl = "";

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
          if (data.success && data.media) {
            successCount++;
            lastUrl = data.media.url;
          }
        })
      );

      if (successCount > 0) {
        setMsg(`✓ Đã tải ${successCount}/${fileArray.length} ảnh thành công!`);
        if (lastUrl) setSelectedUrl(lastUrl);
        fetchMedia();
        setActiveTab("library");
      } else {
        setMsg("Lỗi: Không thể tải các hình ảnh");
      }
    } catch {
      setMsg("Lỗi kết nối khi tải ảnh.");
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedUrl) {
      onSelectImage(selectedUrl);
      onClose();
    }
  };

  const filteredMedia = mediaList.filter((item) =>
    item.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#0d4f4a]" />
            <h2 className="text-base font-bold text-stone-900 font-serif">
              Thư Viện Hình Ảnh (Media Picker)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation & Search */}
        <div className="px-6 py-3 border-b border-stone-200 flex items-center justify-between gap-4 bg-white">
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "library"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Thư viện ảnh ({mediaList.length})
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "upload"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              + Tải ảnh mới lên
            </button>
          </div>

          {activeTab === "library" && (
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm hình ảnh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d4f4a]"
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fafaf9]">
          {activeTab === "library" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredMedia.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer group transition-all h-36 ${
                      isSelected
                        ? "border-[#0d4f4a] ring-4 ring-teal-100 shadow-md"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#0d4f4a] text-white p-1 rounded-full shadow-md">
                        <Check size={14} />
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-stone-950/70 backdrop-blur-xs p-1.5 text-white text-[10px] truncate px-2 font-mono">
                      {item.filename}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Upload Tab */
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 bg-white rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-teal-50 text-[#0d4f4a] rounded-full flex items-center justify-center">
                {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Kéo &amp; Thả nhiều ảnh vào đây hoặc Bấm chọn file</h3>
                <p className="text-xs text-stone-500 mt-1">Hỗ trợ tải lên nhiều tấm cùng lúc (JPG, PNG, WEBP, GIF)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-2.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                {uploading ? "Đang tải ảnh lên..." : "Chọn Ảnh Từ Máy Tính"}
              </button>

              {msg && <p className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg">{msg}</p>}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 bg-white flex items-center justify-between">
          <div className="text-xs text-stone-500 font-mono truncate max-w-md">
            {selectedUrl ? `Đã chọn: ${selectedUrl}` : "Chưa chọn hình ảnh nào"}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold text-xs rounded-xl hover:bg-stone-50"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmSelect}
              disabled={!selectedUrl}
              className="px-6 py-2 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-40 shadow-sm"
            >
              Chọn Hình Ảnh Này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
