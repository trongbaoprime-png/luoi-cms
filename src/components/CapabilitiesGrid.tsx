import Link from "next/link";

export default function CapabilitiesGrid() {
  return (
    <section id="capability" className="border-b border-ink bg-bg">
      <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-14 sm:px-12">
        <div className="flex items-end justify-between gap-6 border-b border-ink pb-5">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            ↘ Bốn năng lực đo lường
          </div>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft md:inline">
            đo cuộc gọi · form · doanh số · booking
          </span>
        </div>

        <div className="grid grid-cols-2 divide-ink lg:grid-cols-4 lg:divide-x mt-6">
          {/* Card 01 */}
          <Link
            className="group flex flex-col px-6 py-7 transition-colors hover:bg-bg-2 border-b lg:border-b-0 border-r border-ink lg:border-r-0"
            href="#dni"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              01 · Đo cuộc gọi
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-serif text-[52px] font-medium leading-[0.95] tracking-[-0.035em] tabular text-ink group-hover:text-brand">
                87
              </span>
              <span className="font-serif text-[18px] font-medium text-ink-soft">%</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-brand">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-brand v2-pulse"
                style={{ boxShadow: "0 0 8px var(--color-brand)" }}
              />
              <span>đang chạy thật</span>
            </div>
            <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand">
              Xem trang →
            </span>
          </Link>

          {/* Card 02 */}
          <div className="flex flex-col px-6 py-7 border-b border-ink lg:border-b-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              02 · Đo biểu mẫu
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-serif text-[52px] font-medium leading-[0.95] tracking-[-0.035em] tabular text-ink">
                đang chạy
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-brand">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-brand v2-pulse"
                style={{ boxShadow: "0 0 8px var(--color-brand)" }}
              />
              <span>đang chạy thật</span>
            </div>
          </div>

          {/* Card 03 */}
          <div className="flex flex-col px-6 py-7 border-r border-ink lg:border-r-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              03 · Đẩy doanh số về Google
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-serif text-[52px] font-medium leading-[0.95] tracking-[-0.035em] tabular text-ink">
                đang chạy
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-brand">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-brand v2-pulse"
                style={{ boxShadow: "0 0 8px var(--color-brand)" }}
              />
              <span>đang chạy thật</span>
            </div>
          </div>

          {/* Card 04 */}
          <div className="flex flex-col px-6 py-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              04 · Nối phần mềm của bạn
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-serif text-[52px] font-medium leading-[0.95] tracking-[-0.035em] tabular text-ink">
                tự động
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              <span>nối riêng theo khách</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
