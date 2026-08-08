"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, Phone, Home, ShieldCheck, Sparkles } from "lucide-react";

export default function ThankYouPage() {
  const [pixelConfig, setPixelConfig] = useState<{
    metaPixelId?: string;
    tiktokPixelCode?: string;
    googleConversionId?: string;
    googleConversionLabel?: string;
  }>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPixelConfig({
            metaPixelId: data.data.meta_pixel_id,
            tiktokPixelCode: data.data.tiktok_pixel_code,
            googleConversionId: data.data.google_conversion_id,
            googleConversionLabel: data.data.google_conversion_label,
          });

          // 1. Fire Client Meta Pixel CompleteRegistration Event
          if (data.data.meta_pixel_id && typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "CompleteRegistration", {
              content_name: "Hoàn Tất Đăng Ký Form",
              currency: "VND",
              value: 7999000,
            });
          }

          // 2. Fire Client TikTok Pixel CompleteRegistration Event
          if (data.data.tiktok_pixel_code && typeof window !== "undefined" && (window as any).ttq) {
            (window as any).ttq.track("CompleteRegistration", {
              content_name: "Hoàn Tất Đăng Ký Form",
              currency: "VND",
              value: 7999000,
            });
          }

          // 3. Fire Client Google Ads Conversion Event
          if (data.data.google_conversion_id && typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "conversion", {
              send_to: `${data.data.google_conversion_id}/${data.data.google_conversion_label || "default"}`,
              event_category: "CompleteRegistration",
              value: 7999000,
              currency: "VND",
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-stone-200 shadow-xl text-center space-y-6 max-w-2xl w-full">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 size={48} />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d4f4a]/10 text-[#0d4f4a] font-mono text-xs font-bold uppercase tracking-wider border border-[#0d4f4a]/30">
              <Sparkles size={14} /> XÁC NHẬN ĐĂNG KÝ THÀNH CÔNG
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-stone-900 leading-tight">
              Cảm Ơn Bạn Đã Đăng Ký Tư Vấn!
            </h1>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed max-w-lg mx-auto">
              Thông tin của bạn đã được chuyển tới chuyên viên tư vấn. Chúng tôi sẽ liên hệ lại qua điện thoại trong vòng <strong className="text-stone-900">15 phút</strong>.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500 flex items-center justify-center gap-2 font-mono">
            <ShieldCheck size={16} className="text-[#0d4f4a] shrink-0" />
            <span>Mã sự kiện chuyển đổi đã được ghi nhận tự động về Meta CAPI &amp; TikTok Events.</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-stone-100 font-mono">
            <a
              href="tel:0839186099"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone size={16} />
              <span>Gọi Hotline Hỗ Trợ Gấp: 0839 186 099</span>
            </a>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Home size={16} />
              <span>Trang Chủ</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
