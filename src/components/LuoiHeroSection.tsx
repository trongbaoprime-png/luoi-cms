"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Heart, Star } from "lucide-react";

function FacebookIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function LuoiHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0d4f4a]/5 via-[#f7f4ed] to-[#f7f4ed] pt-6 pb-10 sm:pt-8 sm:pb-14">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-10 left-10 -z-10 h-72 w-72 rounded-full bg-[#0d4f4a]/10 blur-3xl" />
      <div className="absolute top-20 right-10 -z-10 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center sm:text-left">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black font-serif leading-[1.15] text-[#1a1612] tracking-tight">
              Nhà vẫn gọn, <br />
              <span className="bg-gradient-to-r from-[#0d4f4a] to-[#083b37] bg-clip-text text-transparent">
                dù bạn rất lười.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-xl font-medium font-sans text-[#5c564f] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Mẹo hay – Sản phẩm tiện ích – Cuộc sống nhẹ nhàng hơn mỗi ngày
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3.5 pt-1">
              <Link
                href="#tool-widget"
                className="pulse-button w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#0d4f4a] px-7 py-3.5 sm:py-4 text-base font-mono font-bold text-white shadow-xs hover:bg-[#083b37] hover:shadow-md transition-all"
              >
                <span>KHÁM PHÁ ĐỒ HAY</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                href="#tool-widget"
                className="hidden sm:inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#0d4f4a]/30 bg-white/80 px-6 py-3.5 text-base font-mono font-bold text-[#0d4f4a] hover:bg-[#0d4f4a]/5 transition-colors"
              >
                <span>XEM MẸO NHÀ GỌN</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="hidden sm:flex items-center gap-6 pt-6 border-t border-stone-200 text-xs font-mono font-semibold text-[#5c564f]">
              <div className="flex items-center gap-1.5">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span>4.9/5★ (15.000+ người dùng)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#0d4f4a]" />
                <span>Áp mã giảm giá Shopee tự động</span>
              </div>
            </div>
          </div>

          {/* Right Column: Facebook Voucher Ticket Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[440px] rounded-3xl bg-gradient-to-tr from-[#0d4f4a]/10 via-white to-amber-50/60 p-3.5 shadow-2xl border border-white">
              
              {/* Floating Heart Badge */}
              <div className="absolute -top-4 -right-2 z-10 rounded-2xl bg-[#0d4f4a] px-4 py-2 text-xs font-mono font-bold text-white shadow-xs flex items-center gap-1.5 float-anim">
                <Heart size={14} className="fill-amber-400 text-amber-400" />
                <span>Mua sắm tiết kiệm</span>
              </div>

              {/* Facebook Voucher Ticket Graphic */}
              <div className="relative mx-auto rounded-2xl border-2 border-dashed border-[#f97316]/50 bg-[#fff5f5] p-1 shadow-md overflow-hidden">
                <div className="grid grid-cols-12 rounded-xl overflow-hidden bg-white">
                  
                  {/* Ticket Left Section: Facebook Brand Badge */}
                  <div className="col-span-5 bg-gradient-to-br from-[#ef4444] via-[#f97316] to-[#ea580c] p-4 text-white flex flex-col items-center justify-center text-center relative">
                    <div className="w-12 h-12 rounded-full bg-white text-[#1877f2] flex items-center justify-center shadow-md mb-1">
                      <FacebookIcon className="w-7 h-7 text-[#1877f2]" />
                    </div>
                    <span className="font-serif font-black text-lg tracking-wide uppercase text-white">
                      Facebook
                    </span>
                    <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full mt-0.5">
                      Ưu Đãi Hot
                    </span>
                  </div>

                  {/* Ticket Right Section: Compact Discount Info */}
                  <div className="col-span-7 p-4 flex flex-col justify-between bg-white relative">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-black text-[#44403c]">giảm</span>
                        <span className="text-3xl font-black text-[#f97316] tracking-tight">
                          25%
                        </span>
                      </div>

                      <h3 className="text-base font-black text-[#1c1917] mt-0.5">
                        Giảm tối đa 300kđ
                      </h3>

                      <p className="text-[11px] font-bold text-[#78716c] mt-0.5">
                        Đơn tối thiểu 50kđ
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#f5f5f4] flex items-center justify-between gap-1">
                      <span className="inline-block rounded-md border border-[#f97316] px-2 py-0.5 text-[10px] font-bold text-[#f97316] bg-[#fff7ed]">
                        Ưu Đãi Facebook
                      </span>

                      <div className="text-[10px] text-[#78716c] font-medium">
                        Còn <span className="font-bold text-[#ef4444]">12 giờ</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
