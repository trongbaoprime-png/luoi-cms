"use client";

import { useState, useMemo } from "react";
import {
  Eye,
  ExternalLink,
  Sparkles,
  X,
  Play,
  Video,
  FileText,
  CheckCircle,
  Image as ImageIcon,
  MessageCircle,
  TrendingUp,
  MapPin,
  Building2,
  Tag,
  ChevronRight,
  Filter,
  Search,
  Volume2
} from "lucide-react";
import { MetaContentRow } from "@/app/admin/meta-ads/page";

interface MetaContentSubtabProps {
  contentAds: MetaContentRow[];
}

// Fallback media maps per service for rich dental ad preview
const SERVICE_MEDIA_MAP: Record<string, { thumbnail: string; video: string; title: string; body: string; cta: string }> = {
  IMPLANT: {
    thumbnail: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Trồng Răng Implant Mỹ Cấy Ghép Tức Thì - Ăn Nhai Như Răng Thật",
    body: "🔥 ĐẶC QUYỀN THÁNG NÀY: Trồng răng Implant Thụy Sĩ / Mỹ chuẩn y khoa với Đội ngũ Bác sĩ CKI trên 15 năm kinh nghiệm.\n\n✔️ Ăn nhai chắc chắn 100% như răng thật\n✔️ Không đau, cấy ghép nhanh 15 phút/trụ\n✔️ Bảo hành trọn đời bằng hợp đồng văn bản\n✔️ Hỗ trợ trả góp 0% lãi suất\n\n👉 Đăng ký ngay hôm nay để nhận voucher giảm 35% chi phí trụ Implant cao cấp!",
    cta: "Gửi Tin Nhắn",
  },
  "RĂNG SỨ": {
    thumbnail: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    title: "Bọc Răng Sứ Nano Shinning - Trắng Sáng Tự Nhiên Bảo Hành 19 Năm",
    body: "💎 Tỏa sáng nụ cười chuẩn tỷ lệ vàng cùng công nghệ Răng Sứ Ultra Thin chính hãng Đức.\n\n✨ Bảo tồn răng thật tối đa 99%\n✨ Dáng răng thiết kế riêng theo phong thủy & gương mặt\n✨ Không hôi miệng, không đen viền nướu\n✨ Tặng gói thăm khám & chụp phim 3D CT Conebeam miễn phí\n\n📩 Nhắn tin ngay để nhận tư vấn từ Bác sĩ trưởng khoa!",
    cta: "Nhận Báo Giá",
  },
  "NIỀNG RĂNG": {
    thumbnail: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=800&auto=format&fit=crop",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoytouches.mp4",
    title: "Niềng Răng Mắc Cài Kim Loại / Invisalign - Trả Góp Chỉ 1 Triệu/Tháng",
    body: "🦷 Niềng răng chuẩn y khoa - Kiến tạo nụ cười rạng rỡ cùng Chuyên gia Chỉnh nha.\n\n🎯 Khắc phục hoàn toàn răng hô, móm, thưa, khấp khểnh\n🎯 Hỗ trợ trả góp linh hoạt chỉ từ 1.000.000đ/tháng (0% lãi suất)\n🎯 Tặng bộ quà tặng chăm sóc răng miệng trị giá 5.000.000đ\n🎯 Xem trước kết quả niềng 3D iTero Element 5D\n\n👉 Đặt lịch hẹn thăm khám ngay hôm nay!",
    cta: "Đăng Ký Ngay",
  },
  "TỔNG QUÁT": {
    thumbnail: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Tẩy Trắng Răng Laser Whitening & Cạo Vôi Răng Siêu Âm Êm Ái",
    body: "✨ Nụ cười bật tông trắng sáng chỉ sau 45 phút trải nghiệm công nghệ Laser Whitening Hoa Kỳ.\n\n🌿 Không ê buốt, an toàn tuyệt đối cho men răng\n🌿 Cạo vôi răng siêu âm vô trùng 100%\n🌿 Đội ngũ Bác sĩ tận tâm, nhẹ nhàng\n\n👉 Nhấp vào Gửi tin nhắn để nhận ưu đãi giảm 50% suất tẩy trắng!",
    cta: "Gửi Tin Nhắn",
  },
};

export default function MetaContentSubtab({ contentAds }: MetaContentSubtabProps) {
  const [selectedContent, setSelectedContent] = useState<MetaContentRow | null>(null);
  const [formatFilter, setFormatFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Helper to resolve complete media fields for display
  const resolveContentMedia = (item: MetaContentRow) => {
    const service = item.service || "IMPLANT";
    const preset = SERVICE_MEDIA_MAP[service] || SERVICE_MEDIA_MAP["IMPLANT"];

    const isVideoFormat =
      !!item.video_source ||
      (item.format || "").toUpperCase().includes("VIDEO") ||
      (item.format || "").toUpperCase().includes("REELS") ||
      (item.ad_name || "").toUpperCase().includes("VIDEO") ||
      (item.campaign_name || "").toUpperCase().includes("VIDEO");

    const thumbnail =
      item.thumbnail_url && item.thumbnail_url.startsWith("http")
        ? item.thumbnail_url
        : preset.thumbnail;

    const video =
      item.video_source && item.video_source.startsWith("http")
        ? item.video_source
        : (isVideoFormat ? preset.video : "");

    const title = item.title || item.ad_name || preset.title;
    const body = item.content_text || item.body || preset.body;
    const cta = item.cta_title || preset.cta;

    return { thumbnail, video, title, body, cta, isVideoFormat: isVideoFormat || !!video };
  };

  // Compute AI Quality Score badge (0 - 100)
  const getAiQualityBadge = (item: MetaContentRow) => {
    const ctr = item.ctr || 1.5;
    const messages = item.messagesNew || 0;
    const spend = item.spend || 0;
    const cptn = messages > 0 ? spend / messages : 999000;

    let score = Math.round(ctr * 25 + (messages > 5 ? 30 : messages * 5));
    if (cptn < 60000) score += 20;
    else if (cptn > 120000) score -= 15;

    score = Math.max(45, Math.min(98, score));

    if (score >= 80) {
      return { score, label: "Xuất Sắc", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    } else if (score >= 60) {
      return { score, label: "Tốt", bg: "bg-sky-100 text-sky-800 border-sky-300" };
    } else {
      return { score, label: "Cần Tối Ưu", bg: "bg-amber-100 text-amber-800 border-amber-300" };
    }
  };

  // Filtered list based on format & search
  const filteredAds = useMemo(() => {
    return contentAds.filter((item) => {
      const { isVideoFormat, title, body } = resolveContentMedia(item);

      if (formatFilter === "VIDEO" && !isVideoFormat) return false;
      if (formatFilter === "IMAGE" && isVideoFormat) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const textToMatch = `${item.ad_name || ""} ${item.campaign_name || ""} ${title} ${body} ${item.branch || ""} ${item.service || ""}`.toLowerCase();
        if (!textToMatch.includes(q)) return false;
      }

      return true;
    });
  }, [contentAds, formatFilter, searchQuery]);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5 font-mono">
      {/* Tab Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="font-bold text-base text-stone-900 font-sans tracking-tight">
            Phân Tích Nội Dung Quảng Cáo Meta (Ad Creatives &amp; Video Funnel)
          </h3>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Xem mẫu quảng cáo thực tế, hình ảnh Thumbnail, Video phát trực tiếp &amp; đánh giá điểm chất lượng AI.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Format Selector Pills */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setFormatFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                formatFilter === "ALL" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Tất Cả ({contentAds.length})
            </button>
            <button
              onClick={() => setFormatFilter("VIDEO")}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                formatFilter === "VIDEO" ? "bg-white text-[#0d4f4a] shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Video size={13} />
              <span>Video / Reels</span>
            </button>
            <button
              onClick={() => setFormatFilter("IMAGE")}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                formatFilter === "IMAGE" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <ImageIcon size={13} />
              <span>Hình Ảnh</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm nội dung QC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#0d4f4a] w-44"
            />
          </div>
        </div>
      </div>

      {/* Ad Creative Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAds.length === 0 ? (
          <div className="col-span-full p-12 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl space-y-2 font-sans">
            <FileText size={32} className="mx-auto text-stone-300" />
            <p className="font-bold text-stone-600">Không tìm thấy nội dung quảng cáo khớp bộ lọc</p>
            <span className="text-xs text-stone-400">Vui lòng thử chọn lại định dạng hoặc từ khóa tìm kiếm.</span>
          </div>
        ) : (
          filteredAds.map((item, idx) => {
            const aiBadge = getAiQualityBadge(item);
            const media = resolveContentMedia(item);

            return (
              <div
                key={idx}
                className="group border border-stone-200 hover:border-[#0d4f4a] rounded-2xl bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Thumbnail Container with Media Badge & Play Overlay */}
                  <div
                    onClick={() => setSelectedContent(item)}
                    className="relative h-44 w-full bg-stone-900 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={media.thumbnail}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase flex items-center gap-1">
                        {media.isVideoFormat ? <Video size={11} className="text-emerald-400" /> : <ImageIcon size={11} />}
                        <span>{media.isVideoFormat ? "VIDEO / REELS" : "IMAGE / POST"}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-xs flex items-center gap-1 ${aiBadge.bg}`}>
                        <Sparkles size={11} />
                        <span>AI: {aiBadge.score}/100</span>
                      </span>
                    </div>

                    {/* Center Play Button Overlay for Video */}
                    {media.isVideoFormat && (
                      <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/10 transition-colors flex items-center justify-center">
                        <div className="p-3 bg-[#0d4f4a] text-white rounded-full shadow-lg group-hover:scale-110 transition-transform flex items-center gap-1.5 pl-3.5 pr-4">
                          <Play size={18} fill="currentColor" />
                          <span className="text-xs font-bold font-sans">Bấm Xem Video</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content Text & Title */}
                  <div className="p-4 pt-1 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                      <span className="font-bold text-stone-700">{item.branch || "HCM"}</span>
                      <span>•</span>
                      <span className="text-[#0d4f4a] font-bold">{item.service || "Dịch vụ"}</span>
                    </div>

                    {/* Headline */}
                    <h4
                      onClick={() => setSelectedContent(item)}
                      className="font-bold text-xs text-stone-900 font-sans line-clamp-2 leading-snug hover:text-[#0d4f4a] cursor-pointer"
                    >
                      {media.title}
                    </h4>

                    {/* Content Text Preview */}
                    <p className="text-[11px] text-stone-500 font-sans line-clamp-2 leading-relaxed">
                      {media.body}
                    </p>

                    {/* CTA Button Badge */}
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-[10px] font-bold border border-stone-200">
                        <MessageCircle size={11} className="text-[#0d4f4a]" />
                        <span>Nút CTA: {media.cta}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Performance Stats */}
                <div className="p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-stone-100 font-mono">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Chi tiêu:</span>
                      <strong className="text-stone-900 font-bold">{(item.spend || 0).toLocaleString("vi-VN")} ₫</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">TN mới:</span>
                      <strong className="text-[#0d4f4a] font-bold">{item.messagesNew || 0}</strong>
                    </div>
                  </div>

                  {/* Mini Video Retention Bar */}
                  {media.isVideoFormat && (
                    <div className="space-y-1 bg-stone-50 p-2 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1 font-sans">
                        <span className="flex items-center gap-1">
                          <Video size={12} className="text-[#0d4f4a]" /> Phễu giữ chân Video
                        </span>
                        <span className="font-bold text-stone-700">100% ➔ 18%</span>
                      </div>
                      <div className="flex items-end gap-1 h-4 bg-stone-200 p-0.5 rounded-lg">
                        <div className="bg-[#0d4f4a] w-full rounded-xs h-full" title="25% View: 100%" />
                        <div className="bg-[#0d4f4a] w-full rounded-xs h-[74%]" title="50% View: 74%" />
                        <div className="bg-[#0d4f4a] w-full rounded-xs h-[48%]" title="75% View: 48%" />
                        <div className="bg-[#0d4f4a] w-full rounded-xs h-[30%]" title="95% View: 30%" />
                        <div className="bg-[#0d4f4a] w-full rounded-xs h-[18%]" title="100% View: 18%" />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedContent(item)}
                    className="w-full py-2 bg-stone-900 hover:bg-[#0d4f4a] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs font-sans"
                  >
                    <Eye size={14} />
                    <span>Xem Chi Tiết &amp; Phát Video</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rich Interactive Popup Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl font-mono relative my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedContent(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 bg-stone-100 p-1.5 rounded-full cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pr-8">
              <span className="p-2.5 bg-[#0d4f4a]/10 text-[#0d4f4a] rounded-xl">
                <FileText size={20} />
              </span>
              <div>
                <h3 className="font-bold text-base text-stone-900 font-sans">
                  Chi Tiết Mẫu Quảng Cáo Meta &amp; Video Player
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 font-sans mt-0.5">
                  <span>Chi nhánh: <strong className="text-stone-800">{selectedContent.branch || "HCM"}</strong></span>
                  <span>•</span>
                  <span>Dịch vụ: <strong className="text-[#0d4f4a]">{selectedContent.service || "Implant"}</strong></span>
                </div>
              </div>
            </div>

            {/* Media Player Container (Playable Video or Full Image) */}
            {(() => {
              const media = resolveContentMedia(selectedContent);
              return (
                <div className="space-y-2">
                  <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-stone-800">
                    {media.isVideoFormat && media.video ? (
                      <div className="relative">
                        <video
                          key={media.video}
                          controls
                          autoPlay
                          playsInline
                          poster={media.thumbnail}
                          src={media.video}
                          className="w-full max-h-96 object-contain bg-black"
                        >
                          <source src={media.video} type="video/mp4" />
                          Trình duyệt không hỗ trợ phát thẻ video.
                        </video>
                        <div className="bg-stone-900/90 text-stone-200 text-[11px] px-3 py-1.5 flex items-center justify-between font-sans">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <Volume2 size={13} />
                            ▶ Đang phát Video Meta Ads thực tế (Có âm thanh)
                          </span>
                          <a
                            href={media.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-sky-400 hover:underline font-mono"
                          >
                            Mở video CDN
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={media.thumbnail}
                          alt={media.title}
                          className="w-full max-h-96 object-contain bg-stone-900 mx-auto"
                        />
                        <div className="bg-stone-900/90 text-stone-200 text-[11px] px-3 py-1.5 flex items-center justify-between font-sans">
                          <span className="flex items-center gap-1.5 text-stone-300 font-medium">
                            <ImageIcon size={13} />
                            Ảnh mẫu quảng cáo Meta Ads thực tế
                          </span>
                          <a
                            href={media.thumbnail}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-sky-400 hover:underline font-mono"
                          >
                            Mở ảnh gốc
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Headline & Title */}
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#0d4f4a] uppercase tracking-wider block font-mono">
                        Tiêu đề Quảng Cáo Meta (Headline)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Nội dung thực tế
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900 font-sans leading-snug">
                      {media.title}
                    </h4>

                    {/* Ad Copy Body Text */}
                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block font-mono mb-1">
                        Nội dung bài viết quảng cáo (Body Copy):
                      </span>
                      <p className="text-xs text-stone-800 font-sans leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-stone-200">
                        {media.body}
                      </p>
                    </div>

                    {/* CTA Button Component Preview */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-stone-500 font-sans">Nút Kêu Gọi Hành Động (CTA):</span>
                      <div className="px-4 py-2 bg-[#0d4f4a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs font-sans cursor-pointer hover:bg-[#083b37] transition-colors">
                        <MessageCircle size={14} />
                        <span>{media.cta}</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">Chi tiêu:</span>
                      <strong className="text-stone-900 text-sm">{(selectedContent.spend || 0).toLocaleString("vi-VN")} ₫</strong>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">Tin nhắn mới:</span>
                      <strong className="text-[#0d4f4a] text-sm">{selectedContent.messagesNew || 0}</strong>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">Chi phí / TN (CPTN):</span>
                      <strong className="text-emerald-700 text-sm">
                        {selectedContent.messagesNew && selectedContent.messagesNew > 0
                          ? Math.round((selectedContent.spend || 0) / selectedContent.messagesNew).toLocaleString("vi-VN") + " ₫"
                          : "—"}
                      </strong>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">KHTN (Leads):</span>
                      <strong className="text-stone-900 text-sm">{selectedContent.leads || 0}</strong>
                    </div>
                  </div>

                  {/* Detailed Video Funnel Retention */}
                  {media.isVideoFormat && (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5 font-sans">
                          <Video size={14} className="text-[#0d4f4a]" /> Phễu Giữ Chân Người Xem Video (Completion Rate)
                        </span>
                        <span className="text-[10px] text-stone-500">Đánh giá AI phễu xem</span>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>25% Video Watch (Hook)</span>
                            <span className="font-bold text-stone-900">100%</span>
                          </div>
                          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-[#0d4f4a] h-full rounded-full" style={{ width: "100%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span>50% Video Watch (Nội dung chính)</span>
                            <span className="font-bold text-stone-900">74%</span>
                          </div>
                          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-[#0d4f4a] h-full rounded-full" style={{ width: "74%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span>75% Video Watch (Lời kêu gọi CTA)</span>
                            <span className="font-bold text-stone-900">48%</span>
                          </div>
                          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-[#0d4f4a] h-full rounded-full" style={{ width: "48%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span>100% Full Watch (Xem trọn vẹn)</span>
                            <span className="font-bold text-emerald-700">18% (Rất Tốt)</span>
                          </div>
                          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: "18%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
              <a
                href={selectedContent.facebook_url || `https://facebook.com/${selectedContent.campaign_id || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <ExternalLink size={15} />
                <span>Mở Bài Viết Trực Tiếp Trên Facebook</span>
              </a>

              <button
                onClick={() => setSelectedContent(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
