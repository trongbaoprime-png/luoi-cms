"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Sparkles, BookOpen } from "lucide-react";

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function LuoiHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e7e5e4] bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-3 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center">
            <Image
              src="/images/luoidonnhangang.png"
              alt="LƯỜI DỌN NHÀ - Logo"
              width={160}
              height={40}
              priority
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-mono font-bold text-[#44403c] uppercase tracking-wider">
          <Link href="/" className="text-[#0d4f4a] flex items-center gap-1.5 border-b-2 border-[#0d4f4a] pb-0.5">
            Trang Chủ
          </Link>
          <Link href="/blog" className="hover:text-[#0d4f4a] transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Mẹo Hay &amp; Blog</span>
          </Link>
          <Link href="#reels-section" className="hover:text-[#0d4f4a] transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Video Reels</span>
          </Link>
          <Link href="#tool-widget" className="hover:text-[#0d4f4a] transition-colors flex items-center gap-1.5">
            <ShoppingBag size={15} />
            <span>Deal Hot</span>
          </Link>
          <Link href="/admin" className="px-3 py-1 bg-[#042d2a] text-white rounded-lg text-[11px] font-mono font-bold hover:bg-[#0d4f4a] transition-colors">
            Quản Trị Admin
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="#tool-widget"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0d4f4a] px-4 py-2.5 text-xs font-mono font-bold text-white shadow-xs hover:bg-[#083b37] hover:shadow-md transition-all"
          >
            <span>Nhận Voucher 25%</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
