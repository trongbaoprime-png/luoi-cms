"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Eye, Sparkles, Film, ExternalLink } from "lucide-react";

export interface ReelVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  videoUrl?: string;
  shortcode?: string;
}

const DEFAULT_REELS: ReelVideo[] = [
  {
    id: "reel-1",
    title: "Mẹo Dọn Phòng Khách Siêu Nhanh Trong 5 Phút",
    thumbnail: "/images/luoidonnhangang.png",
    views: "15.4K",
    shortcode: "[shortcode_reels_1]",
  },
  {
    id: "reel-2",
    title: "Review Thực Tế Robot Hút Bụi Tự Động Lau Nhà",
    thumbnail: "/images/luoidonnhangang.png",
    views: "28.9K",
    shortcode: "[shortcode_reels_2]",
  },
  {
    id: "reel-3",
    title: "Bí Quyết Giữ Răng Miệng Trắng Sáng Tại Nhà",
    thumbnail: "/images/luoidonnhangang.png",
    views: "42.1K",
    shortcode: "[shortcode_reels_3]",
  },
  {
    id: "reel-4",
    title: "Top 5 Đồ Gia Dụng Thông Minh Đáng Tiền Nhất",
    thumbnail: "/images/luoidonnhangang.png",
    views: "19.8K",
    shortcode: "[shortcode_reels_4]",
  },
];

export default function ReelsVideoSection({ videos = DEFAULT_REELS }: { videos?: ReelVideo[] }) {
  const [activeVideo, setActiveVideo] = useState<ReelVideo | null>(null);

  return (
    <section id="reels-section" className="scroll-mt-14 py-8 bg-gradient-to-b from-stone-50 via-[#f0fdfa]/40 to-stone-50 border-y border-stone-200/80">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8 space-y-6">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0d4f4a] text-white flex items-center justify-center shadow-xs">
              <Film size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <span>Video Ngắn / Reels Mẹo Hay &amp; Review</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase rounded-full">
                  HOT Shorts
                </span>
              </h2>
              <p className="text-xs text-stone-500">Video review thực tế tự động chèn qua Shortcode hệ thống</p>
            </div>
          </div>

          <span className="text-xs font-bold text-[#0d4f4a] hover:underline cursor-pointer">
            Xem Tất Cả Video &rarr;
          </span>
        </div>

        {/* 4-Item Reels Video Carousel Grid (Vùng tô đỏ thứ 2) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
          {videos.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveVideo(item)}
              className="group relative aspect-[9/14] rounded-2xl overflow-hidden bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-200/80 hover:-translate-y-1"
            >
              {/* Background Thumbnail Image */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={300}
                height={480}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                loading="lazy"
              />

              {/* Top View Counter Badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full text-[11px] font-bold text-white border border-white/20">
                <Eye size={12} className="text-teal-400" />
                <span>{item.views}</span>
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#0d4f4a]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#0d4f4a] transition-all">
                  <Play size={22} className="fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Caption & Shortcode Badge */}
              <div className="absolute bottom-3 left-3 right-3 z-20 space-y-1">
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white font-mono text-[9px] font-bold rounded">
                  {item.shortcode || "[shortcode_reels]"}
                </span>
                <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-teal-300 transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player (Shortcode Embedded) */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden max-w-md w-full border border-slate-800 text-white shadow-2xl space-y-4 p-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-teal-400" />
                <span className="font-bold text-sm">Xem Video Shortcode</span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-[9/16] bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3 border border-slate-800">
              <Film size={40} className="text-teal-400 animate-bounce" />
              <h4 className="font-bold text-sm text-slate-200">{activeVideo.title}</h4>
              <p className="text-xs text-slate-400 font-mono">
                Mã Shortcode: <span className="text-amber-400 font-bold">{activeVideo.shortcode}</span>
              </p>
              <div className="text-[11px] text-slate-500">
                Nhúng video YouTube Shorts / TikTok / Facebook Reels bằng Shortcode trực tiếp trong trang quản trị Admin.
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
