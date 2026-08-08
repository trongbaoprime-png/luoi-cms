import { Link2, Percent, ShoppingCart, ArrowRight } from "lucide-react";

export default function WorkflowSteps() {
  const steps = [
    {
      step: "01",
      icon: <Link2 className="text-[#0d4f4a]" size={32} />,
      title: "Dán link Shopee",
      desc: "Sao chép và dán link sản phẩm Shopee mà bạn muốn mua vào công cụ."
    },
    {
      step: "02",
      icon: <Percent className="text-amber-500" size={32} />,
      title: "Hệ thống áp voucher",
      desc: "Tự động áp mã giảm giá ưu đãi & hoàn tiền tích lũy tốt nhất."
    },
    {
      step: "03",
      icon: <ShoppingCart className="text-emerald-600" size={32} />,
      title: "Mua sắm và tiết kiệm",
      desc: "Hoàn tất đơn hàng trên ứng dụng Shopee với mức giá rẻ nhất nhanh chóng."
    }
  ];

  return (
    <section className="py-14 px-4 sm:px-8 max-w-[1240px] mx-auto text-center">
      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0d4f4a] mb-2 block">
        Quy Trình 3 Bước Đơn Giản
      </span>
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#1c1917] tracking-tight mb-12">
        Cách hoạt động
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="relative rounded-3xl bg-white p-8 border border-[#e7e5e4] shadow-md flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-all"
          >
            {/* Step Number Badge */}
            <span className="absolute top-4 right-4 text-3xl font-black text-[#e7e5e4] font-mono">
              {item.step}
            </span>

            <div className="w-20 h-20 rounded-2xl bg-[#fafaf9] border border-[#f5f5f4] flex items-center justify-center shadow-inner">
              {item.icon}
            </div>

            <h3 className="font-sans font-black text-xl text-[#1c1917]">
              {item.title}
            </h3>

            <p className="text-sm text-[#78716c] leading-relaxed max-w-xs">
              {item.desc}
            </p>

            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight size={24} className="text-[#a8a29e]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
