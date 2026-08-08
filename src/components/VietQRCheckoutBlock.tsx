"use client";

import { useState } from "react";
import { QrCode, CheckCircle2, Copy, ShieldCheck, ShoppingCart } from "lucide-react";

interface Props {
  title?: string;
  subtitle?: string;
}

export default function VietQRCheckoutBlock({ title, subtitle }: Props) {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    product: "Robot Lau Nhà Dreame L20 Ultra - 14.990.000đ",
  });
  const [showQR, setShowQR] = useState(false);

  // Incomplete Lead Capture (Save draft as user types onBlur)
  const handleBlur = () => {
    if (formData.name || formData.phone) {
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name: formData.name || "Khách Hàng Chưa Hoàn Tất",
          email: formData.phone || "N/A",
          message: `[Incomplete Draft Order]: Product: ${formData.product}, Address: ${formData.address}`,
        }),
      }).catch(() => {});
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQR(true);

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        name: formData.name,
        email: formData.phone,
        message: `[KÍCH HOẠT ĐƠN HÀNG VIETQR]: ${formData.product} - Địa chỉ: ${formData.address}`,
      }),
    });
  };

  const copyAcc = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-4xl mx-auto px-4">
      <div className="bg-gradient-to-b from-stone-900 to-teal-950 text-white p-8 rounded-3xl border border-teal-800 shadow-2xl space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-bold uppercase tracking-widest border border-teal-700">
            <ShieldCheck size={14} fill="currentColor" />
            LadiPage &amp; Webcake VietQR Automated Payment
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-amber-300">
            {title || "Đặt Hàng Nhanh & Thanh Toán QR Tự Động"}
          </h2>
          <p className="text-stone-300 text-xs md:text-sm">
            {subtitle || "Nhập thông tin nhận hàng, quét mã QR VietQR để được miễn phí vận chuyển 100%!"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Order Form */}
          <form onSubmit={handleCheckout} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Họ và tên người nhận *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={handleBlur}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 bg-stone-800/80 border border-stone-700 text-white rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Số điện thoại Zalo / SMS *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={handleBlur}
                placeholder="0912345678"
                className="w-full px-4 py-3 bg-stone-800/80 border border-stone-700 text-white rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Địa chỉ giao hàng chi tiết *</label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                onBlur={handleBlur}
                placeholder="Số house, tên đường, phường/xã, quận/huyện..."
                className="w-full px-4 py-3 bg-stone-800/80 border border-stone-700 text-white rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Chọn gói sản phẩm</label>
              <select
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 text-amber-300 font-bold rounded-xl focus:outline-none"
              >
                <option>Robot Lau Nhà Dreame L20 Ultra - 14.990.000đ</option>
                <option>Máy Hút Bụi Cầm Tay Roborock H7 - 5.490.000đ</option>
                <option>Combo Vệ Sinh Nhà Cửa Thông Minh - 18.990.000đ</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-sm uppercase rounded-xl shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              <span>TẠO MÃ VIETQR THANH TOÁN</span>
            </button>
          </form>

          {/* VietQR Display Frame */}
          <div className="bg-white text-stone-950 p-6 rounded-2xl shadow-2xl text-center space-y-4 border-2 border-amber-400">
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase text-[#0d9488]">
              <QrCode size={16} />
              <span>VietQR Tự Động Xác Nhận</span>
            </div>

            {showQR ? (
              <div className="space-y-3 animate-fade-in">
                <div className="w-48 h-48 mx-auto bg-stone-100 p-2 rounded-xl border border-stone-300 flex items-center justify-center">
                  <img
                    src={`https://api.vietqr.io/image/970422-0912345678-compact2.png?amount=14990000&addInfo=LUOI${formData.phone.slice(-4)}&accountName=LUOI%20DON%20NHA`}
                    alt="VietQR Payment"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border text-left text-xs font-mono space-y-1">
                  <p><strong>Ngân hàng:</strong> MBBank (Quân Đội)</p>
                  <p className="flex items-center justify-between">
                    <span><strong>STK:</strong> 0912345678</span>
                    <button
                      onClick={() => copyAcc("0912345678")}
                      className="text-[10px] bg-stone-200 hover:bg-stone-300 px-2 py-0.5 rounded font-sans font-bold"
                    >
                      {copied ? "Đã chép" : "Chép STK"}
                    </button>
                  </p>
                  <p><strong>Chủ TK:</strong> LUOI DON NHA</p>
                  <p><strong>Nội dung:</strong> LUOI{formData.phone.slice(-4)}</p>
                </div>
                <p className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} /> Hệ thống tự động duyệt đơn khi nhận tiền chuyển khoản
                </p>
              </div>
            ) : (
              <div className="py-12 space-y-3">
                <QrCode className="w-16 h-16 mx-auto text-stone-300" />
                <p className="text-xs text-stone-500">Điền thông tin và bấm nút <strong>"TẠO MÃ VIETQR"</strong> để tạo mã chuyển khoản tự động.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
