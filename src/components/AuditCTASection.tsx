import Link from "next/link";

export default function AuditCTASection() {
  return (
    <section id="audit" className="bg-bg px-6 py-20 sm:px-12 border-b border-ink">
      <div className="mx-auto grid max-w-[1280px] gap-20 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Phụ lục · liên hệ
          </div>
          <h3 className="mt-5 max-w-[640px] font-serif text-[34px] font-medium leading-[1.05] tracking-[-0.025em] text-ink lg:text-[44px]">
            Đặt 60 phút. Chúng tôi xem tài khoản Google Ads hiện tại và nói thẳng chỗ đang hỏng.
          </h3>
          <Link
            className="mt-7 inline-flex items-center gap-1.5 rounded-xs bg-ink px-[26px] py-4 font-sans text-[14px] font-medium text-bg transition-opacity hover:opacity-90"
            href="#booking-form"
          >
            Đặt buổi tư vấn <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="border-l border-ink pl-10">
          <div className="mb-4 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            Phương pháp
          </div>
          <p className="m-0 font-serif text-[14px] leading-[1.6] text-ink">
            Số liệu trên trang đọc từ bảng điều khiển 1fix.vn, kỳ 05/06 tới 29/06/2026: 1.055 trên 1.216 cuộc gọi trong 25 ngày truy được về đúng quảng cáo. 1fix.vn là hệ thống do chính chúng tôi xây và vận hành, không phải khách hàng trả tiền.
          </p>
          <div className="mt-6 font-mono text-[11px] text-ink-soft">
            path.vn · 2026 · solo founder build
          </div>
        </div>
      </div>
    </section>
  );
}
