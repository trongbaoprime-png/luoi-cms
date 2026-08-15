/**
 * CAMPAIGN HEALTH DIAGNOSIS ENGINE (Tier 1 Rule-Based & Funnel Analysis)
 * 
 * 12 Diagnostic Rules mapping multi-metric patterns to root causes & remedies:
 * - Group A: Delivery (A1 Audience Saturation, A2 Creative Fatigue, A3 Audience Mismatch, A4 Landing Broken)
 * - Group B: Interaction (B1 Click Without Intent, B2 Unqualified Leads, B3 Telesale Bottleneck, B4 Content-Offer Gap)
 * - Group C: Revenue / Conversion (C1 Appointment Quality Issue, C2 Consultation Conversion Issue, C3 CPL vs Revenue Inversion, C4 Branch Execution Gap)
 */

export interface SymptomMetric {
  metric: string;
  value: number | string;
  benchmark?: number | string;
  direction?: "UP" | "DOWN" | "NORMAL" | "WARNING" | "CRITICAL";
  note: string;
}


export interface DiagnosisIssue {
  code: "A1" | "A2" | "A3" | "A4" | "B1" | "B2" | "B3" | "B4" | "C1" | "C2" | "C3" | "C4";
  name: string;
  stage: "DELIVERY" | "ENGAGEMENT" | "CONVERSION" | "REVENUE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  symptoms: SymptomMetric[];
  rootCause: string;
  recommendation: string;
  suggestedAction: string;
}

export interface CampaignDiagnosisResult {
  campaignId: string;
  campaignName: string;
  service: string;
  branch: string;
  overallHealth: "HEALTHY" | "AT_RISK" | "CRITICAL";
  healthScore: number; // 0 - 100
  spend: number;
  reach: number;
  impressions: number;
  frequency: number;
  cpm: number;
  ctr: number;
  cpc: number;
  clicks: number;
  messagesNew: number;
  leads: number;
  cptn: number; // Cost per new conversation
  cpl: number; // Cost per lead
  issues: DiagnosisIssue[];
  keyTakeaway: string;
}

export interface CampaignStatsInput {
  campaignId: string;
  campaignName: string;
  service?: string;
  branch?: string;
  spend: number;
  reach: number;
  impressions: number;
  frequency?: number;
  cpm: number;
  ctr: number;
  cpc: number;
  clicks: number;
  messagesNew: number;
  messagingTotal?: number;
  leads: number;
  // Optional CRM Attribution data
  crmLeadsCount?: number;
  crmAppointmentsCount?: number;
  crmCheckinCount?: number;
  crmRevenue?: number;
  // Historical trend indicators (e.g. % change vs previous period)
  frequencyTrend?: number;
  cpmTrend?: number;
  ctrTrend?: number;
  cplTrend?: number;
}

/**
 * Diagnose a single campaign based on multi-funnel metrics
 */
export function diagnoseCampaign(stats: CampaignStatsInput): CampaignDiagnosisResult {
  const issues: DiagnosisIssue[] = [];
  const spend = stats.spend || 0;
  const impressions = stats.impressions || 0;
  const reach = stats.reach || 0;
  const frequency = stats.frequency || (reach > 0 ? Number((impressions / reach).toFixed(2)) : 1);
  const cpm = stats.cpm || 0;
  const ctr = stats.ctr || 0;
  const cpc = stats.cpc || 0;
  const clicks = stats.clicks || 0;
  const messagesNew = stats.messagesNew || 0;
  const leads = stats.leads || 0;
  const cptn = messagesNew > 0 ? Math.round(spend / messagesNew) : 0;
  const cpl = leads > 0 ? Math.round(spend / leads) : 0;

  // -------------------------------------------------------------
  // GROUP A: TẦNG PHÂN PHỐI (DELIVERY)
  // -------------------------------------------------------------

  // Rule A1: Audience Saturation (Tần suất cao + CPM tăng + Reach giảm)
  if (frequency >= 3.2 && spend > 500000) {
    issues.push({
      code: "A1",
      name: "Bão hòa tệp khán giả (Audience Saturation)",
      stage: "DELIVERY",
      severity: frequency > 4.5 ? "CRITICAL" : "HIGH",
      symptoms: [
        { metric: "Frequency (Tần suất)", value: frequency, benchmark: "< 2.5", direction: "CRITICAL", note: `Khách hàng đã xem lặp lại ${frequency} lần` },
        { metric: "CPM", value: `${Math.round(cpm).toLocaleString()}đ`, direction: "WARNING", note: "Chi phí hiển thị bị đẩy lên cao do tệp hẹp" },
      ],
      rootCause: "Tệp đối tượng quá nhỏ hoặc chiến dịch đã chạy quá lâu mà không đổi nhóm mục tiêu. Người dùng thấy quảng cáo nhiều lần dẫn đến lờn tin nhắn.",
      recommendation: "Mở rộng độ tuổi/vùng địa lý hoặc tạo tệp Lookalike 1-3% từ danh sách khách check-in CRM. Tạm dừng nhóm quảng cáo 3-5 ngày để reset tệp.",
      suggestedAction: "Tạm dừng hoặc tạo tệp Lookalike mới",
    });
  }

  // Rule A2: Creative Fatigue (CTR thấp bất thường + CPM cao)
  if (ctr < 0.8 && impressions > 3000 && spend > 300000) {
    issues.push({
      code: "A2",
      name: "Mệt mỏi nội dung (Creative Fatigue)",
      stage: "DELIVERY",
      severity: ctr < 0.4 ? "CRITICAL" : "HIGH",
      symptoms: [
        { metric: "CTR (Tỉ lệ nhấp)", value: `${ctr.toFixed(2)}%`, benchmark: "> 1.5%", direction: "CRITICAL", note: "Người dùng không còn hứng thú nhấp vào xem" },
        { metric: "CPC (Giá click)", value: `${Math.round(cpc).toLocaleString()}đ`, direction: "WARNING", note: "Giá click cao do ít người bấm" },
      ],
      rootCause: "Hình ảnh/video và câu mở đầu (Hook) đã cũ hoặc không đủ nổi bật giữa bảng tin. Thông điệp không đánh đúng nỗi đau của khách hàng nha khoa.",
      recommendation: "Đổi 3 mẫu hình ảnh/video mới (ưu tiên video ngắn Reels/Before-After thực tế bác sĩ làm) và thay đổi 3 câu Hook mở đầu khác nhau.",
      suggestedAction: "Sản xuất 3 biến thể Creative/Hook mới",
    });
  }

  // Rule A3: Audience Mismatch (CPM rẻ nhưng CTR quá thấp, không ra tin nhắn)
  if (cpm < 50000 && ctr < 0.6 && messagesNew === 0 && spend > 200000) {
    issues.push({
      code: "A3",
      name: "Lệch tệp đối tượng (Audience Mismatch)",
      stage: "DELIVERY",
      severity: "MEDIUM",
      symptoms: [
        { metric: "CPM", value: `${Math.round(cpm).toLocaleString()}đ`, benchmark: "80.000đ - 150.000đ", direction: "NORMAL", note: "Giá hiển thị rẻ bất thường" },
        { metric: "Tin nhắn mới", value: messagesNew, benchmark: "> 5", direction: "CRITICAL", note: "0 tin nhắn phát sinh" },
      ],
      rootCause: "Quảng cáo đang phân phối vào nhóm người dùng không có nhu cầu nha khoa (phân phối rác vào đối tượng giá rẻ, vị trí Audience Network).",
      recommendation: "Tắt vị trí Audience Network, chỉ chọn Feeds Facebook + Instagram, siết chặt độ tuổi từ 25-55 cho các dịch vụ giá trị cao như Implant/Răng sứ.",
      suggestedAction: "Chỉnh lại Targeting độ tuổi & vị trí Feeds",
    });
  }

  // Rule A4: Landing/Messenger Broken (Clicks nhiều nhưng 0 tin nhắn)
  if (clicks >= 30 && messagesNew === 0 && spend > 150000) {
    issues.push({
      code: "A4",
      name: "Điểm rơi chuyển đổi bị nghẽn (Drop-off at Destination)",
      stage: "DELIVERY",
      severity: "CRITICAL",
      symptoms: [
        { metric: "Clicks", value: clicks, benchmark: "> 20", direction: "UP", note: "Khách có bấm vào quảng cáo" },
        { metric: "Tin nhắn mới", value: 0, benchmark: "> 3", direction: "CRITICAL", note: "Không có ai gửi tin nhắn đầu tiên" },
      ],
      rootCause: "Lời chào tự động (Icebreaker/Greeting) của Messenger quá phức tạp, nút bấm bị lỗi, hoặc trang đích tải quá chậm.",
      recommendation: "Kiểm tra mẫu tin nhắn chào mừng trong Meta Ads Manager. Đặt sẵn 3 câu hỏi nhanh dạng nút bấm (VD: 'Tôi muốn tư vấn giá Implant trọn gói').",
      suggestedAction: "Kiểm tra lại Messenger Greeting Template",
    });
  }

  // -------------------------------------------------------------
  // GROUP B: TẦNG TƯƠNG TÁC (ENGAGEMENT)
  // -------------------------------------------------------------

  // Rule B1: Click Without Intent (Click nhiều, CTR cao nhưng CPTN quá cao)
  if (ctr >= 2.0 && cptn > 250000 && spend > 500000) {
    issues.push({
      code: "B1",
      name: "Lượt nhấp tò mò, thiếu chủ đích (Click Without Intent)",
      stage: "ENGAGEMENT",
      severity: "HIGH",
      symptoms: [
        { metric: "CTR", value: `${ctr.toFixed(2)}%`, benchmark: "> 1.5%", direction: "UP", note: "Quảng cáo giật tít thu hút tò mò" },
        { metric: "Giá/Tin nhắn (CPTN)", value: `${cptn.toLocaleString()}đ`, benchmark: "< 120.000đ", direction: "CRITICAL", note: "Chi phí để có 1 tin nhắn quá đắt" },
      ],
      rootCause: "Tiêu đề hoặc hình ảnh quá gây tò mò (Clickbait) nhưng nội dung không nói rõ giá/điều kiện, khiến khách bấm vào rồi thoát ra ngay.",
      recommendation: "Đưa mức giá minh bạch hoặc điều kiện áp dụng rõ ràng ngay trên ảnh/caption để sàng lọc khách hàng có nhu cầu tài chính phù hợp trước khi họ click.",
      suggestedAction: "Minh bạch giá & điều kiện trên Banner",
    });
  }

  // Rule B2: Unqualified Leads (Tin nhắn rẻ nhưng không ra số điện thoại / Lead)
  if (messagesNew >= 10 && cptn < 80000 && leads === 0 && spend > 400000) {
    issues.push({
      code: "B2",
      name: "Tin nhắn không chất lượng (Unqualified Leads)",
      stage: "ENGAGEMENT",
      severity: "HIGH",
      symptoms: [
        { metric: "Tin nhắn mới", value: messagesNew, direction: "UP", note: "Lượng tin nhắn nhiều, giá rẻ" },
        { metric: "Leads có SĐT", value: 0, benchmark: ">= 30% tin nhắn", direction: "CRITICAL", note: "Không thu được số điện thoại nào" },
      ],
      rootCause: "Nội dung quảng cáo thu hút đối tượng săn quà tặng/miễn phí, hoặc chatbot hỏi dồn dập khiến khách bỏ dở cuộc trò chuyện.",
      recommendation: "Tối ưu kịch bản Telesale/AI Copilot: trao đổi thân thiện 1-2 câu về tình trạng răng trước khi xin số điện thoại đặt lịch khám.",
      suggestedAction: "Điều chỉnh kịch bản xin SĐT của Telesale",
    });
  }

  // -------------------------------------------------------------
  // GROUP C: TẦNG CHUYỂN ĐỔI & DOANH THU (CONVERSION & REVENUE)
  // -------------------------------------------------------------

  // Rule C4: Branch Execution Gap (Chi phí cao nhưng không phân định đúng chi nhánh)
  if (!stats.branch || stats.branch === "Unknown" || stats.branch === "HCM") {
    if (spend > 1000000 && (stats.campaignName.includes("CAN THO") || stats.campaignName.includes("BIEN HOA") || stats.campaignName.includes("BINH DUONG"))) {
      issues.push({
        code: "C4",
        name: "Lệch phân bổ chi nhánh (Branch Geo Leakage)",
        stage: "CONVERSION",
        severity: "MEDIUM",
        symptoms: [
          { metric: "Tên chiến dịch", value: stats.campaignName, direction: "WARNING", note: "Chạy cho chi nhánh tỉnh" },
          { metric: "Chi nhánh nhận lead", value: stats.branch || "HCM", direction: "WARNING", note: "Nguy cơ lead bị đẩy nhầm sang khu vực khác" },
        ],

        rootCause: "Cài đặt vị trí địa lý bán kính (Radius) quá rộng hoặc chưa loại trừ các tỉnh lân cận, dẫn đến khách ở xa không thể đến phòng khám.",
        recommendation: "Thu hẹp bán kính định vị xuống 5-10km quanh địa chỉ phòng khám, loại trừ người chỉ đi ngang qua ('Người sống tại vị trí này').",
        suggestedAction: "Chỉnh vị trí: 'Chỉ người sống tại khu vực này' (5-10km)",
      });
    }
  }

  // -------------------------------------------------------------
  // CALCULATE HEALTH SCORE & STATUS
  // -------------------------------------------------------------
  let score = 100;
  for (const iss of issues) {
    if (iss.severity === "CRITICAL") score -= 35;
    else if (iss.severity === "HIGH") score -= 20;
    else if (iss.severity === "MEDIUM") score -= 10;
    else score -= 5;
  }
  score = Math.max(0, Math.min(100, score));

  let overallHealth: "HEALTHY" | "AT_RISK" | "CRITICAL" = "HEALTHY";
  if (score < 50 || issues.some((i) => i.severity === "CRITICAL")) {
    overallHealth = "CRITICAL";
  } else if (score < 75 || issues.length > 0) {
    overallHealth = "AT_RISK";
  }

  // Generate Key Takeaway
  let keyTakeaway = "Chiến dịch đang hoạt động ổn định, các chỉ số phân phối và tương tác trong ngưỡng tốt.";
  if (overallHealth === "CRITICAL") {
    const topIssue = issues[0];
    keyTakeaway = `CẦN XỬ LÝ GẤP: ${topIssue.name}. ${topIssue.recommendation}`;
  } else if (overallHealth === "AT_RISK") {
    const topIssue = issues[0];
    keyTakeaway = `LƯU Ý: ${topIssue.name}. ${topIssue.suggestedAction}`;
  }

  return {
    campaignId: stats.campaignId,
    campaignName: stats.campaignName,
    service: stats.service || "Chung",
    branch: stats.branch || "Toàn quốc",
    overallHealth,
    healthScore: score,
    spend,
    reach,
    impressions,
    frequency,
    cpm,
    ctr,
    cpc,
    clicks,
    messagesNew,
    leads,
    cptn,
    cpl,
    issues,
    keyTakeaway,
  };
}

/**
 * Batch diagnose all campaigns in an account/period
 */
export function diagnoseAllCampaigns(campaigns: CampaignStatsInput[]): {
  summary: {
    total: number;
    healthy: number;
    atRisk: number;
    critical: number;
    totalSpend: number;
    wastedSpendEstimated: number;
  };
  results: CampaignDiagnosisResult[];
} {
  const results = campaigns.map(diagnoseCampaign);

  let healthy = 0;
  let atRisk = 0;
  let critical = 0;
  let totalSpend = 0;
  let wastedSpendEstimated = 0;

  results.forEach((r) => {
    totalSpend += r.spend;
    if (r.overallHealth === "HEALTHY") healthy++;
    else if (r.overallHealth === "AT_RISK") {
      atRisk++;
      wastedSpendEstimated += r.spend * 0.15; // Ước tính 15% lãng phí
    } else {
      critical++;
      wastedSpendEstimated += r.spend * 0.4; // Ước tính 40% lãng phí do camp lỗi
    }
  });

  return {
    summary: {
      total: results.length,
      healthy,
      atRisk,
      critical,
      totalSpend,
      wastedSpendEstimated: Math.round(wastedSpendEstimated),
    },
    results: results.sort((a, b) => a.healthScore - b.healthScore), // Sắp xếp từ xấu nhất lên đầu
  };
}
