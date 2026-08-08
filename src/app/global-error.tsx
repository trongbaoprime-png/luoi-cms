"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#f7f4ed] text-[#1a1612] p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-4">
          <span className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-mono font-black text-xl mx-auto shadow-xs">
            !
          </span>
          <h2 className="text-xl font-bold font-serif text-stone-900">
            Lỗi Hệ Thống
          </h2>
          <p className="text-xs text-stone-500 font-mono leading-relaxed">
            {error.message || "Vui lòng bấm tải lại hoặc quay về trang chủ."}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3 font-mono text-xs font-bold">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#0d4f4a] text-white rounded-xl hover:bg-[#083b37] transition-all shadow-xs"
            >
              Tải lại
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-all"
            >
              Trang Chủ
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
