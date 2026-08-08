"use client";

import { useState } from "react";
import { Gift, Sparkles, CheckCircle2, Copy } from "lucide-react";

interface Props {
  title?: string;
  subtitle?: string;
}

export default function LuckyWheelBlock({ title, subtitle }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const prizes = [
    { label: "Voucher 50k", code: "LUOI50K", color: "#0d9488" },
    { label: "Freeship 0Đ", code: "FREESHIP0D", color: "#f59e0b" },
    { label: "Giảm 30% Robot", code: "ROBOT30", color: "#ec4899" },
    { label: "Voucher 100k", code: "LUOI100K", color: "#8b5cf6" },
    { label: "Giảm 20% Đồ Bếp", code: "BEP20", color: "#10b981" },
    { label: "Mã Thêm 30k", code: "BONUS30", color: "#ef4444" },
  ];

  const spin = () => {
    if (spinning || winner) return;
    setSpinning(true);

    const randomIndex = Math.floor(Math.random() * prizes.length);
    const sliceDegree = 360 / prizes.length;
    const targetDegree = 360 * 5 + (360 - randomIndex * sliceDegree - sliceDegree / 2);

    setRotation(targetDegree);

    setTimeout(() => {
      setSpinning(false);
      setWinner(prizes[randomIndex].label + " - Mã: " + prizes[randomIndex].code);
    }, 4500);
  };

  const copyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-gradient-to-b from-stone-900 via-teal-950 to-stone-900 text-white py-16 px-4 rounded-3xl max-w-5xl mx-auto shadow-2xl space-y-8 relative overflow-hidden border border-teal-800">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} />
          Gamification Coupon Game
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold font-serif text-amber-300">
          {title || "Vòng Quay May Mắn - Săn Mã Giảm Giá"}
        </h2>
        <p className="text-stone-300 text-xs md:text-sm">
          {subtitle || "Quay là 100% trúng thưởng Voucher mua hàng Shopee, Lazada độc quyền hôm nay!"}
        </p>
      </div>

      {/* Interactive Wheel Graphic */}
      <div className="flex flex-col items-center justify-center relative py-4">
        {/* Pointer Arrow */}
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 z-20 -mb-4 filter drop-shadow-md" />

        {/* Wheel Disk Container */}
        <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full border-8 border-amber-400 shadow-2xl overflow-hidden">
          <div
            className="w-full h-full rounded-full transition-transform duration-[4500ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {prizes.map((prize, i) => {
                const angle = 360 / prizes.length;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                const x1 = Number((50 + 50 * Math.cos((Math.PI * startAngle) / 180)).toFixed(4));
                const y1 = Number((50 + 50 * Math.sin((Math.PI * startAngle) / 180)).toFixed(4));
                const x2 = Number((50 + 50 * Math.cos((Math.PI * endAngle) / 180)).toFixed(4));
                const y2 = Number((50 + 50 * Math.sin((Math.PI * endAngle) / 180)).toFixed(4));

                const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={i}>
                    <path d={d} fill={prize.color} />
                    <text
                      x="70"
                      y="52"
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="bold"
                      transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                    >
                      {prize.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Spin Button */}
          <button
            onClick={spin}
            disabled={spinning || !!winner}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-white text-stone-950 font-black text-sm uppercase shadow-2xl flex items-center justify-center tracking-tight hover:scale-105 active:scale-95 transition-transform disabled:opacity-80"
          >
            {spinning ? "Đang quay..." : winner ? "Đã Quay" : "QUAY NGAY"}
          </button>
        </div>
      </div>

      {/* Winner Popup Modal */}
      {winner && (
        <div className="bg-amber-400 text-stone-950 p-6 rounded-2xl max-w-md mx-auto text-center space-y-3 shadow-2xl animate-bounce">
          <Gift className="w-10 h-10 mx-auto text-stone-900" />
          <h3 className="font-extrabold text-xl">CHÚC MỪNG BẠN ĐÃ TRÚNG THƯỞNG!</h3>
          <p className="font-bold font-mono text-sm bg-white/80 py-2 rounded-lg text-stone-900">
            {winner}
          </p>
          <button
            onClick={() => copyCode(winner.split("Mã: ")[1] || "LUOI50K")}
            className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2"
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            <span>{copied ? "Đã sao chép mã!" : "Sao chép mã & Dùng ngay"}</span>
          </button>
        </div>
      )}
    </section>
  );
}
