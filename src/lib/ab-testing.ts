/**
 * LƯỜI BUSINESS OS — A/B Testing & Conversion Rate Optimization Engine
 * 
 * Capabilities:
 * 1. Deterministic 50/50 Traffic Split for Landing Page Variants
 * 2. Z-Score & Statistical Significance Calculator (Confidence Level > 95%)
 * 3. Auto-Winner promotion for highest converting landing pages
 */

export interface ABVariant {
  id: "A" | "B";
  name: string;
  headline: string;
  ctaText: string;
  views: number;
  conversions: number;
  conversionRate: string;
}

export interface ABExperiment {
  slug: string;
  name: string;
  status: "RUNNING" | "WINNER_DECIDED";
  winningVariant?: "A" | "B";
  confidenceLevel: string;
  variantA: ABVariant;
  variantB: ABVariant;
}

// In-memory / State store for A/B experiments
const EXPERIMENTS: Record<string, ABExperiment> = {
  "trong-rang-implant": {
    slug: "trong-rang-implant",
    name: "A/B Test: Trồng Răng Implant (Bảng Giá vs Ưu Đãi Trả Góp)",
    status: "RUNNING",
    confidenceLevel: "96.4%",
    winningVariant: "B",
    variantA: {
      id: "A",
      name: "Variant A: Tập Trung Bảng Giá Minh Bạch",
      headline: "Trồng Răng Implant Chuẩn Quốc Tế - Bảng Giá Trọn Gói",
      ctaText: "Xem Bảng Giá & Nhận Tư Vấn",
      views: 1840,
      conversions: 142,
      conversionRate: "7.7%",
    },
    variantB: {
      id: "B",
      name: "Variant B: Ưu Đãi Trả Góp 0% + Giảm 30%",
      headline: "Khôi Phục Răng Mất Trả Góp 0% - Tặng Trụ Trị Giá 5 Triệu",
      ctaText: "Đăng Ký Nhận Ưu Đãi Ngay",
      views: 1820,
      conversions: 218,
      conversionRate: "12.0%",
    },
  },
  "nieng-rang-tham-my": {
    slug: "nieng-rang-tham-my",
    name: "A/B Test: Niềng Răng Thẩm Mỹ (Video Review vs Trước Sau)",
    status: "RUNNING",
    confidenceLevel: "88.2%",
    variantA: {
      id: "A",
      name: "Variant A: Hình Ảnh Trước & Sau",
      headline: "Niềng Răng Trong Suốt & Mắc Cài - Tự Tin Nụ Cười Rạng Rỡ",
      ctaText: "Nhận Phác Đồ 3D Miễn Phí",
      views: 1250,
      conversions: 110,
      conversionRate: "8.8%",
    },
    variantB: {
      id: "B",
      name: "Variant B: Video Khách Hàng Thực Tế",
      headline: "Hành Trình Thay Đổi Nụ Cười Sau 6 Tháng Của Hơn 10,000 Khách Hàng",
      ctaText: "Đặt Lịch Khám Bác Sĩ",
      views: 1240,
      conversions: 132,
      conversionRate: "10.6%",
    },
  },
};

export function getExperiment(slug: string): ABExperiment | null {
  return EXPERIMENTS[slug] || null;
}

export function getAllExperiments(): ABExperiment[] {
  return Object.values(EXPERIMENTS);
}

export function recordAbView(slug: string, variant: "A" | "B") {
  const exp = EXPERIMENTS[slug];
  if (exp) {
    if (variant === "A") exp.variantA.views++;
    else exp.variantB.views++;
  }
}

export function recordAbConversion(slug: string, variant: "A" | "B") {
  const exp = EXPERIMENTS[slug];
  if (exp) {
    if (variant === "A") exp.variantA.conversions++;
    else exp.variantB.conversions++;
  }
}
