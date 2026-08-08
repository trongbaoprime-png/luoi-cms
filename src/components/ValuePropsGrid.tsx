import { Leaf, ShoppingBag, ShieldCheck, Clock } from "lucide-react";

export default function ValuePropsGrid() {
  const props = [
    {
      icon: <Leaf className="text-[#0d4f4a]" size={28} />,
      title: "MẸO HAY",
      subtitle: "Dễ áp dụng",
      desc: "Cách sắp xếp nhà cửa 5 phút giúp không gian luôn gọn gàng."
    },
    {
      icon: <ShoppingBag className="text-[#0d4f4a]" size={28} />,
      title: "SẢN PHẨM",
      subtitle: "Tiện ích",
      desc: "Tuyển chọn các thiết bị gia dụng & đồ dùng thông minh đáng mua nhất."
    },
    {
      icon: <ShieldCheck className="text-emerald-600" size={28} />,
      title: "KHÔNG GIAN",
      subtitle: "Gọn gàng",
      desc: "Tối ưu hóa từng mét vuông phòng khách, phòng ngủ & gian bếp."
    },
    {
      icon: <Clock className="text-amber-500" size={28} />,
      title: "TIẾT KIỆM",
      subtitle: "Thời gian",
      desc: "Giảm 80% thời gian dọn dẹp hàng tuần để tận hưởng cuộc sống."
    }
  ];

  return (
    // Hidden on Mobile screens, visible on Tablet & Desktop (sm:block)
    <section className="hidden sm:block py-10 px-4 sm:px-8 max-w-[1240px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {props.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white p-6 border border-[#e7e5e4] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#fafaf9] border border-[#f5f5f4] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="font-serif font-bold text-base text-[#1c1917] tracking-tight">
              {item.title}
            </h3>
            <span className="text-xs font-mono font-bold text-[#0d4f4a] block mb-2">
              {item.subtitle}
            </span>
            <p className="text-xs text-[#78716c] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
