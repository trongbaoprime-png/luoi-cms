"use client";

import { useState } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  beforeImg?: string;
  afterImg?: string;
}

export default function ImageComparisonBlock({
  title,
  subtitle,
  beforeImg,
  afterImg,
}: Props) {
  const [sliderPos, setSliderPos] = useState(50);

  const defaultBefore = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80"; // Dirty room
  const defaultAfter = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"; // Clean room

  return (
    <section className="max-w-4xl mx-auto px-4 space-y-6 text-center">
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold text-[#0d4f4a] uppercase tracking-widest">
          Hiệu Quả Thực Tế (Webcake Visual Compare)
        </span>
        <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-900">
          {title || "Hình Ảnh So Sánh Trước & Sau Khi Dọn Dẹp"}
        </h2>
        <p className="text-xs text-stone-500">{subtitle || "Kéo thanh trượt để thấy sự khác biệt vượt trội khi dùng thiết bị thông minh"}</p>
      </div>

      <div className="relative w-full max-w-3xl h-80 md:h-96 mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white select-none">
        {/* After Image (Clean) */}
        <img
          src={afterImg || defaultAfter}
          alt="Sau khi lau dọn"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          Sau Khi Dọn (Sạch 99.9%)
        </div>

        {/* Before Image (Dirty - Clipped) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeImg || defaultBefore}
            alt="Trước khi lau dọn"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: "100%", height: "100%" }}
          />
          <div className="absolute top-4 left-4 bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            Trước Khi Dọn (Bụi bẩn)
          </div>
        </div>

        {/* Slider Handle Divider */}
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white border-2 border-[#0d4f4a] shadow-xl flex items-center justify-center text-xs font-bold text-[#0d4f4a]">
            ↔
          </div>
        </div>

        {/* Range Slider Overlay Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </section>
  );
}
