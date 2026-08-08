"use client";

import { useState } from "react";
import { Puzzle, Check, Copy, FormInput, Table, Sparkles, ShieldCheck, ExternalLink, Play } from "lucide-react";

interface ShortcodeSelectorProps {
  onInsert: (code: string) => void;
}

export default function ShortcodeSelector({ onInsert }: ShortcodeSelectorProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const shortcodesList = [
    {
      code: "[form-dang-ky]",
      title: "Form Đăng Ký Tư Vấn (Nhận Leads)",
      desc: "Chèn khối Form khách hàng điền Họ tên, SĐT, Dịch vụ và nhắn ghi chú.",
      icon: FormInput,
      color: "bg-[#0d4f4a]/10 text-[#0d4f4a] border-[#0d4f4a]/30",
    },
    {
      code: "[bang-gia-dich-vu]",
      title: "Bảng Giá Dịch Vụ 3 Cột Nổi Bật",
      desc: "Bảng giá so sánh 3 gói dịch vụ (Theo giờ, Tổng vệ sinh, Giặt sofa).",
      icon: Table,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      code: "[slide-uu-dai]",
      title: "Banner Ưu Đãi Giảm 20% & Hotline",
      desc: "Khối banner thu hút CTR đăng ký nhận ưu đãi tháng này + Nút gọi Hotline.",
      icon: Sparkles,
      color: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      code: "[cam-ket-chat-luong]",
      title: "Khối 4 Cam Kết Chất Lượng Dịch Vụ",
      desc: "Hiển thị 4 biểu tượng lòng tin (Bảo hành 24h, Đúng giá, An toàn, 24/7).",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      code: "[nhung-doi-tac]",
      title: "Nhúng Công Cụ Đối Tác (AFP)",
      desc: "Chèn khung công cụ chuyển đổi link tự động từ hệ thống đối tác qini-home.afp.ad.",
      icon: ExternalLink,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      code: "[video-reels]",
      title: "Khung Video Shorts / Reels",
      desc: "Hiển thị dải 4 video ngắn dạng Reels/TikTok Shorts nhúng qua URL bên dưới.",
      icon: Play,
      color: "bg-rose-50 text-rose-600 border-rose-200",
    },
  ];

  const handleSelect = (code: string) => {
    onInsert(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3 font-sans">
      <div className="flex items-center justify-between font-mono">
        <h4 className="font-bold text-xs uppercase text-stone-800 flex items-center gap-1.5 font-serif">
          <Puzzle size={15} className="text-[#0d4f4a]" /> Thư Viện Shortcode Blocks
        </h4>
        <span className="text-[10px] text-stone-500">Chèn vào nội dung bài viết</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {shortcodesList.map((item) => {
          const Icon = item.icon;
          const isCopied = copiedCode === item.code;
          return (
            <div
              key={item.code}
              onClick={() => handleSelect(item.code)}
              className="bg-white p-3 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 group-hover:text-[#0d4f4a] transition-colors font-serif">
                    <span className={`p-1 rounded-lg border ${item.color}`}>
                      <Icon size={13} />
                    </span>
                    {item.title}
                  </div>
                </div>
                <p className="text-[10px] text-stone-500 leading-tight font-sans">{item.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-stone-100 font-mono">
                <code className="text-[10px] font-mono font-bold text-[#0d4f4a] bg-[#0d4f4a]/10 px-2 py-0.5 rounded-md border border-[#0d4f4a]/20">
                  {item.code}
                </code>
                <span className="text-[10px] font-bold text-stone-600 group-hover:text-[#0d4f4a] flex items-center gap-1">
                  {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  {isCopied ? "Đã chèn!" : "+ Chèn vào bài"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
