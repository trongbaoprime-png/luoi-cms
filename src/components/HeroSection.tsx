import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="border-b border-ink bg-bg">
      {/* Subheader Metadata Bar */}
      <div className="mx-auto flex max-w-[1280px] justify-between border-b border-ink-dim/40 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft sm:px-12">
        <span>Số 05 · Q2 2026</span>
        <span className="text-brand font-semibold">Báo cáo Path · Đo lường Google Ads</span>
        <span>path.vn · hub v0.5</span>
      </div>

      {/* Main Headline */}
      <div className="mx-auto max-w-[1280px] px-6 pt-14 sm:px-12 lg:pt-[72px]">
        <h1 className="m-0 max-w-[1080px] font-serif text-[42px] font-medium leading-[1.02] tracking-[-0.025em] text-ink sm:text-[56px] lg:text-[72px]">
          Bao nhiêu ngân sách<br />
          Google Ads của bạn{" "}
          <em className="italic text-brand font-serif">đang đi mù?</em>
        </h1>
        <p className="mt-7 max-w-[720px] font-serif text-[18px] leading-[1.55] text-ink-soft lg:text-[20px]">
          Phòng khám, dịch vụ tại nhà, xưởng dịch vụ: khách xem quảng cáo rồi gọi điện, nhưng không ai biết cuộc gọi nào đến từ quảng cáo nào. Path đo phần đó, rồi báo ngược cho Google để nó tiêu tiền đúng chỗ.
        </p>
      </div>

      {/* Giant Stats Grid */}
      <div className="mx-auto mt-12 grid max-w-[1280px] grid-cols-1 border-y border-ink lg:mt-16 lg:grid-cols-2 lg:divide-x lg:divide-ink">
        {/* Stat 1: Unmeasured Calls */}
        <div className="flex flex-col gap-6 border-b border-ink px-6 py-12 sm:px-12 lg:border-b-0 lg:py-16">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-bad">
            ↘ Phần không ai nhìn thấy
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-serif font-medium leading-[0.85] tracking-[-0.06em] tabular text-ink"
              style={{ fontSize: "clamp(120px, 18vw, 240px)" }}
            >
              325
            </span>
          </div>
          <p className="max-w-[440px] font-serif text-[17px] leading-[1.55] text-ink">
            Người bấm nút gọi, xem số, rồi <strong>không gọi</strong>, trong 25 ngày trên một website duy nhất. Không đo thì bạn không biết những người này từng tồn tại.
          </p>
          <p className="max-w-[440px] font-sans text-[12px] leading-[1.6] text-ink-soft">
            325 trên 1.302 người · 1fix.vn · 05/06 → 29/06/2026
          </p>
        </div>

        {/* Stat 2: Measured Attribution */}
        <div className="flex flex-col gap-6 bg-bg-2 px-6 py-12 sm:px-12 lg:py-16">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            ↗ Đo được · trên hệ thống thật
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-serif font-medium leading-[0.85] tracking-[-0.06em] tabular text-brand"
              style={{ fontSize: "clamp(120px, 18vw, 240px)" }}
            >
              87
            </span>
            <span
              className="font-serif font-medium leading-[1] tracking-[-0.04em] text-brand"
              style={{ fontSize: "clamp(48px, 6vw, 84px)" }}
            >
              %
            </span>
          </div>
          <p className="max-w-[440px] font-serif text-[17px] leading-[1.55] text-ink">
            Cuộc gọi truy được về đúng quảng cáo đã tạo ra nó: 1.055 trên 1.216 cuộc gọi vào số riêng · 25 ngày.
          </p>
          <p className="max-w-[440px] font-sans text-[12px] leading-[1.6] text-ink-soft">
            Đo trên 1fix.vn, kỳ 05/06 → 29/06/2026. Hệ thống do chính chúng tôi xây và vận hành, không phải khách hàng trả tiền.
          </p>
        </div>
      </div>

      {/* Banner Action Bar */}
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 border-b border-ink px-6 py-7 sm:px-12">
        <p className="m-0 max-w-[640px] font-serif text-[17px] leading-[1.5] text-ink">
          Buổi tư vấn 60 phút. Chúng tôi mở tài khoản Google Ads của bạn ra xem, chỉ những chỗ đang mất dấu khách. Không bán gì trong buổi đó.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link
            className="inline-flex items-center gap-1.5 rounded-xs bg-ink px-[22px] py-[14px] font-sans text-[14px] font-medium text-bg transition-opacity hover:opacity-90"
            href="#audit"
          >
            Đặt audit miễn phí <span aria-hidden="true">→</span>
          </Link>
          <Link
            className="inline-flex items-center rounded-xs border border-ink bg-transparent px-5 py-[14px] font-sans text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-bg"
            href="#dni"
          >
            Cách đo cuộc gọi hoạt động ra sao
          </Link>
        </div>
      </div>
    </section>
  );
}
