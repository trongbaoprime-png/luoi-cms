import Link from "next/link";
import Header from "@/components/Header";
import LuoiFooter from "@/components/LuoiFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ed] text-[#1a1612] font-sans">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-4">
          <span className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0d4f4a] flex items-center justify-center font-mono font-black text-2xl mx-auto shadow-xs">
            404
          </span>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Không Tìm Thấy Trang
          </h1>
          <p className="text-xs text-stone-500 font-mono leading-relaxed">
            Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ mới.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-[#0d4f4a] text-white font-mono font-bold text-xs rounded-xl hover:bg-[#083b37] transition-all shadow-xs"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </main>
      <LuoiFooter />
    </div>
  );
}
