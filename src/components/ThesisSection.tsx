export default function ThesisSection() {
  return (
    <section className="border-b border-ink bg-bg px-6 py-24 sm:px-12">
      <div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[0.5fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            ↘ Luận điểm
          </div>
          <p className="font-serif text-[15px] leading-[1.5] text-ink-soft">
            Chúng tôi không bán phần mềm báo cáo. Chúng tôi làm cho dữ liệu chạy đúng, rồi để Google Ads tự học từ dữ liệu đó.
          </p>
        </div>

        <div className="flex flex-col gap-7 max-w-[680px]">
          <p className="m-0 font-serif text-[22px] leading-[1.4] tracking-[-0.01em] text-ink lg:text-[26px]">
            Phòng khám, dịch vụ sửa chữa, gara ô tô đều bán thứ khách phải{" "}
            <em className="italic">đến tận nơi</em> mới nhận được. Khách xem quảng cáo, rồi gọi, rồi đặt lịch, rồi mới tới. Mỗi bước rơi mất một phần dấu vết, và Google Ads không nhìn thấy bước nào trong số đó.
          </p>

          <p className="m-0 font-serif text-[17px] leading-[1.65] text-ink">
            Path đo lại phần đó. Cuộc gọi: mỗi người xem web một số riêng, gọi vào là biết đến từ quảng cáo nào, đo được 87% trên 1fix.vn. Biểu mẫu trên trang. Lịch hẹn, và quan trọng hơn là doanh thu của ca đã làm xong. Ghép cái nào là tuỳ khách đang mất dấu ở đâu.
          </p>

          <p className="m-0 font-serif text-[17px] leading-[1.65] text-ink">
            Lắp một lần, chạy liên tục. Chúng tôi không chạy quảng cáo thay bạn và không bán phần mềm báo cáo. Đây là lớp đo lường lắp bên dưới tài khoản Google Ads sẵn có: ai đang chạy quảng cáo cho bạn thì vẫn người đó, chỉ khác là họ có số liệu đúng để tối ưu.
          </p>

          {/* Pricing Row */}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-ink pt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              ↘ Mức giá
            </span>
            <span className="font-serif text-[20px] text-ink">
              Từ <strong>30 triệu</strong> lắp đặt, cộng{" "}
              <strong>5 triệu mỗi tháng</strong> vận hành
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              tuỳ những thứ cần đo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
