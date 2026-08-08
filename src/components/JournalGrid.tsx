import Link from "next/link";

export default function JournalGrid() {
  const articles = [
    {
      part: "Phần 1",
      title: "Vì sao ở Việt Nam không đo được cuộc gọi từ quảng cáo Google",
      desc: "Google có sẵn công cụ đo cuộc gọi, nhưng nó cần một thứ Việt Nam không có. Bài này giải thích khoảng trống đó nằm ở đâu và vì sao các công cụ quốc tế không lấp được.",
      href: "#blog-1",
    },
    {
      part: "Phần 2",
      title: "Bốn cái bẫy khi tự làm hệ thống đo cuộc gọi",
      desc: "Cấp số riêng cho từng người xem web nghe đơn giản. Bốn lỗi dưới đây chỉ lộ ra khi chạy thật, và cái đắt nhất đã gán nhầm nguồn quảng cáo cho 168 đơn hàng.",
      href: "#blog-2",
    },
    {
      part: "Phần 3",
      title: "Đo được bao nhiêu, và phần nào vẫn chưa đo được",
      desc: "87% cuộc gọi truy được về đúng quảng cáo: 1.055 trên 1.216 cuộc trong 25 ngày, cùng phần hệ thống không đo được.",
      href: "#blog-3",
    },
    {
      part: "Phần 4",
      title: "Đếm cuộc gọi hay đếm tiền: khác biệt nằm ở đâu",
      desc: "Báo cho Google biết 'có cuộc gọi' và báo 'cuộc gọi này ra 15 triệu' là hai việc khác nhau. Cái thứ hai đổi hẳn cách Google tiêu tiền của bạn.",
      href: "#blog-4",
    },
  ];

  return (
    <section id="journal" className="border-b border-ink bg-bg px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-[760px]">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Ba phần · viết từ hệ thống đang chạy
          </div>
          <h2 className="mt-6 font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.025em] text-ink lg:text-[44px]">
            Khoảng trống nằm ở đâu, lấp bằng cách nào, đo được bao nhiêu.
          </h2>
        </div>

        <div className="mt-10 grid gap-0 border-y border-ink md:grid-cols-2 lg:grid-cols-4">
          {articles.map((item, idx) => (
            <Link
              key={idx}
              className={`group flex flex-col p-8 transition-colors hover:bg-bg-2 ${
                idx < articles.length - 1 ? "md:border-r md:border-ink border-b md:border-b-0" : ""
              }`}
              href={item.href}
            >
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                {item.part}
              </div>
              <h3 className="mt-4 font-serif text-[20px] font-medium leading-[1.3] tracking-[-0.015em] text-ink group-hover:text-brand">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 font-serif text-[14px] leading-[1.55] text-ink-soft">
                {item.desc}
              </p>
              <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                Đọc tiếp →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
