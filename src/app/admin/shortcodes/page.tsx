"use client";

import { useState, useEffect } from "react";
import MediaPickerModal from "@/components/MediaPickerModal";
import {
  DynamicPricingBlock,
  DynamicFormBlock,
  StandaloneBannerBlock,
  StandaloneButtonBlock,
  ProviderOffersBlock,
  PromotionalSliderBlock,
  LuckySpinBlock,
  CustomCanvasBlock,
  CamKetBlock,
  DynamicPricingConfig,
  DynamicFormConfig,
  StandaloneBannerConfig,
  StandaloneButtonConfig,
  DynamicSliderConfig,
  LuckySpinConfig,
  CustomCanvasConfig,
  CustomCanvasElement,
  LuckySpinItem,
  SlideItemConfig,
  PricingColumnConfig,
  FormFieldConfig,
  CustomColorsConfig,
} from "@/components/ShortcodeContentParser";
import {
  Puzzle,
  Copy,
  Check,
  Sparkles,
  FormInput,
  Table,
  ShieldCheck,
  Gift,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Flame,
  Layers,
  Sliders,
  Store,
  MousePointer,
  Megaphone,
  LayoutGrid,
  Palette,
  RotateCw,
  Trophy,
  Tag,
  X,
  Layout,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface SavedBlock {
  id: string;
  name: string;
  key: string;
  type: string;
  configJson: string;
  updatedAt: string;
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
}) {
  const defaultVal = value || "#0d9488";
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-stone-700">{label}</label>
      <div className="flex items-center gap-1.5 bg-white p-1 border border-stone-300 rounded-xl shadow-2xs">
        <input
          type="color"
          value={defaultVal.startsWith("#") ? defaultVal : "#0d9488"}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 shrink-0"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#HEX"
          className="w-full px-1.5 py-0.5 font-mono text-[11px] uppercase focus:outline-none text-stone-800"
        />
      </div>
    </div>
  );
}

function CtaLinkInput({
  label = "Hành Động Khi Click Nút CTA",
  value = "",
  onChange,
  formBlocks = [],
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  formBlocks?: any[];
}) {
  const isPopup = value.startsWith("popup:");
  const isScroll = value.startsWith("#") || value.startsWith(".");

  return (
    <div className="space-y-1.5 p-2.5 bg-stone-50/80 rounded-xl border border-stone-200">
      <label className="block text-[11px] font-bold text-stone-800">{label}</label>

      {/* Mode Buttons Selector */}
      <div className="grid grid-cols-3 gap-1 mb-1">
        <button
          type="button"
          onClick={() => onChange(isPopup || isScroll ? "tel:0901234567" : value || "tel:0901234567")}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
            !isPopup && !isScroll
              ? "bg-[#0d9488] text-white border-[#0d9488]"
              : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
          }`}
        >
          🌐 URL / Tel
        </button>

        <button
          type="button"
          onClick={() => onChange("popup:form-header")}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
            isPopup
              ? "bg-sky-600 text-white border-sky-600"
              : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
          }`}
        >
          📋 Popup Form
        </button>

        <button
          type="button"
          onClick={() => onChange(isScroll ? value : "#section-id")}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
            isScroll
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
          }`}
        >
          🎯 Thẻ #/ .
        </button>
      </div>

      {isPopup ? (
        <div className="space-y-1">
          <select
            value={value.replace("popup:", "") || "form-header"}
            onChange={(e) => onChange(`popup:${e.target.value}`)}
            className="w-full px-2.5 py-1.5 border border-sky-300 rounded-lg text-xs font-bold text-sky-900 bg-sky-50 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="form-header">Form Đăng Ký Header (Mặc Định)</option>
            {formBlocks.map((blk) => (
              <option key={blk.id || blk.key} value={blk.key}>
                {blk.name} (Key: [block key="{blk.key}"])
              </option>
            ))}
          </select>
          <span className="text-[10px] text-sky-700 block font-medium">
            💡 Click sẽ mở khung Form Popup ứng với mẫu Form được chọn.
          </span>
        </div>
      ) : isScroll ? (
        <div className="space-y-1">
          <input
            type="text"
            placeholder="VD: #form-dang-ky, #bang-gia, hoặc .contact-section"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs font-mono text-amber-900 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <span className="text-[10px] text-amber-700 block font-medium">
            💡 Click sẽ cuộn mượt tới thẻ (`#id` hoặc `.class`) tương ứng trên trang.
          </span>
        </div>
      ) : (
        <div className="space-y-1">
          <input
            type="text"
            placeholder="VD: tel:0901234567 hoặc https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono text-stone-800 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <span className="text-[10px] text-stone-500 block">
            💡 Mở đường dẫn URL hoặc gọi trực tiếp Hotline (`tel:0901234567`).
          </span>
        </div>
      )}
    </div>
  );
}

export default function AdminShortcodesPage() {
  const [activeTab, setActiveTab] = useState<"builder" | "library" | "templates">("builder");
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>([]);
  const [formBlocks, setFormBlocks] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Media Picker Modal State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ type: string; slideIdx?: number } | null>(null);

  // Builder Core State
  const [blockName, setBlockName] = useState("Vòng Quay May Mắn Tri Ứng Khách Hàng");
  const [blockKey, setBlockKey] = useState("vong-quay-uu-dai-2026");
  const [blockType, setBlockType] = useState<"PRICING" | "FORM" | "BANNER" | "BUTTON" | "SLIDER" | "LUCKY_SPIN" | "CUSTOM_CANVAS" | "VOUCHER">("LUCKY_SPIN");
  const [editingId, setEditingId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 1. PRICING BUILDER CONFIG STATE
  // -------------------------------------------------------------
  const [pricingConfig, setPricingConfig] = useState<DynamicPricingConfig>({
    title: "Báo Giá Dịch Vụ Chăm Sóc Nhà Cửa",
    subtitle: "Bảng giá minh bạch, cam kết chất lượng, bảo hành 24H",
    customColors: {
      bg: "",
      titleColor: "",
      textColor: "",
      buttonBg: "",
      buttonText: "",
      borderColor: "",
      priceColor: "",
    },
    banner: {
      enabled: true,
      badge: "ƯU ĐÃI THÁNG NÀY",
      headline: "Giảm Ngay 20% Cho Đơn Hàng Đầu Tiên",
      subtitle: "Nhập mã LUOI20OFF khi liên hệ tư vấn hôm nay.",
      ctaText: "Gọi 0901.234.567",
      ctaUrl: "tel:0901234567",
      imageUrl: "",
    },
    columns: [
      {
        name: "Dọn Theo Giờ",
        subtitle: "Gói Tiêu Chuẩn",
        price: "80.000đ",
        unit: "/giờ",
        features: ["Dọn dẹp phòng khách & phòng ngủ", "Lau sàn, rửa chén bát & gấp đồ", "Dụng cụ vệ sinh tiêu chuẩn"],
        ctaText: "Đặt Lịch Giờ →",
        ctaUrl: "tel:0901234567",
      },
      {
        name: "Căn Hộ / Nhà Phố",
        subtitle: "Gói Tổng Vệ Sinh",
        price: "1.290.000đ",
        unit: "/lần",
        isHighlighted: true,
        badgeText: "BÁN CHẠY NHẤT",
        features: [
          "Đội 3-4 nhân sự dọn sâu toàn diện",
          "Máy hút bụi công nghiệp 1800W",
          "Lau kính cao tầng & khử khuẩn nhà tắm",
          "Nghiệm thu đạt mới thanh toán",
        ],
        ctaText: "Đặt Tổng Vệ Sinh Ngay →",
        ctaUrl: "tel:0901234567",
      },
      {
        name: "Giặt Sofa & Nệm",
        subtitle: "Gói Chuyên Sâu",
        price: "350.000đ",
        unit: "/bộ",
        features: ["Giặt phun hút hơi nước nóng 140°C", "Phun sương Nano Ag+ diệt khuẩn 99.9%", "Thổi khô sấy nhanh sử dụng sau 2H"],
        ctaText: "Đặt Giặt Sofa →",
        ctaUrl: "tel:0901234567",
      },
    ],
  });

  // -------------------------------------------------------------
  // 2. FORM BUILDER CONFIG STATE
  // -------------------------------------------------------------
  const [formConfig, setFormConfig] = useState<DynamicFormConfig>({
    title: "Đăng Ký Tư Vấn & Nhận Ưu Đãi 30%",
    subtitle: "Để lại thông tin để được hỗ trợ báo giá nhanh chóng trong ngày",
    badge: "FORM TƯƠNG TÁC TÙY BIẾN",
    submitText: "GỬI ĐĂNG KÝ NGAY",
    successMsg: "Đăng Ký Thành Công! Chuyên viên sẽ liên hệ hỗ trợ bạn trong 15 phút.",
    customColors: {
      bg: "",
      titleColor: "",
      textColor: "",
      buttonBg: "",
      buttonText: "",
      borderColor: "",
    },
    fields: [
      { id: "f1", label: "Họ và tên", name: "name", type: "text", placeholder: "VD: Nguyễn Văn A", required: true },
      { id: "f2", label: "Số điện thoại", name: "phone", type: "tel", placeholder: "VD: 0901 234 567", required: true },
      {
        id: "f3",
        label: "Dịch vụ quan tâm",
        name: "service",
        type: "select",
        options: ["Lau dọn nhà cửa định kỳ", "Tổng vệ sinh căn hộ", "Vệ sinh sofa, nệm & thảm", "Khác / Yêu cầu riêng"],
      },
      { id: "f4", label: "Ghi chú thêm", name: "note", type: "text", placeholder: "Thời gian hoặc địa chỉ mong muốn..." },
    ],
  });

  // -------------------------------------------------------------
  // 3. STANDALONE BANNER CONFIG STATE
  // -------------------------------------------------------------
  const [bannerConfig, setBannerConfig] = useState<StandaloneBannerConfig>({
    badge: "ƯU ĐÃI ĐẶC BIỆT THÁNG NÀY",
    headline: "Giảm Ngay 20% Cho Đơn Hàng Đầu Tiên",
    subtitle: "Áp dụng toàn bộ dịch vụ dọn dẹp căn hộ và tổng vệ sinh khi liên hệ Hotline hôm nay.",
    couponCode: "LUOI20OFF",
    ctaText: "Gọi 0901.234.567 Ngay",
    ctaUrl: "tel:0901234567",
    imageUrl: "",
    customColors: {
      bg: "",
      titleColor: "",
      textColor: "",
      buttonBg: "",
      buttonText: "",
      badgeBg: "",
    },
  });

  // -------------------------------------------------------------
  // 4. STANDALONE BUTTON CONFIG STATE
  // -------------------------------------------------------------
  const [buttonConfig, setButtonConfig] = useState<StandaloneButtonConfig>({
    text: "LIÊN HỆ ĐẶT LỊCH NGAY →",
    url: "tel:0901234567",
    style: "teal",
    align: "center",
    customColors: {
      buttonBg: "",
      buttonText: "",
      borderColor: "",
    },
  });

  // -------------------------------------------------------------
  // 5. SLIDER BUILDER CONFIG STATE
  // -------------------------------------------------------------
  const [sliderConfig, setSliderConfig] = useState<DynamicSliderConfig>({
    title: "ĐỘI NGŨ CHUYÊN GIA BÁC SĨ NHIỀU NĂM KINH NGHIỆM",
    subtitle: "Hệ thống trang thiết bị hiện đại & quy trình phục vụ tận tâm",
    layout: "CARD_GRID",
    showBottomCta: true,
    bottomCtaText: "🎁 ĐĂNG KÝ KHÁM & TƯ VẤN MIỄN PHÍ",
    bottomCtaUrl: "tel:0901234567",
    customColors: {
      bg: "",
      titleColor: "",
      textColor: "",
      buttonBg: "",
      buttonText: "",
      priceColor: "",
    },
    slides: [
      {
        id: "s1",
        title: "Phạm Nguyễn",
        subtitle: "Bác sĩ Chuyên khoa I",
        description: "Chuyên gia cấy ghép Implant - Hơn 14 năm kinh nghiệm",
        imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
        showCta: true,
        ctaText: "Xem chi tiết →",
        ctaUrl: "tel:0901234567",
      },
      {
        id: "s2",
        title: "Răng Sứ Katana Nhật Bản",
        subtitle: "Bọc Răng Sứ Thẩm Mỹ",
        price: "2.800.000Đ",
        badge: "BÁN CHẠY NHẤT",
        imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
        showCta: true,
        ctaText: "Đặt Lịch Ngay →",
        ctaUrl: "tel:0901234567",
      },
      {
        id: "s3",
        title: "Răng Sứ Cercon HT",
        subtitle: "Bọc Răng Sứ Cao Cấp",
        price: "4.000.000Đ",
        badge: "ƯU ĐÃI 30%",
        imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop",
        showCta: true,
        ctaText: "Đặt Lịch Ngay →",
        ctaUrl: "tel:0901234567",
      },
    ],
  });

  // -------------------------------------------------------------
  // 6. LUCKY SPIN BUILDER CONFIG STATE
  // -------------------------------------------------------------
  const [luckySpinConfig, setLuckySpinConfig] = useState<LuckySpinConfig>({
    title: "QUAY LÀ TRÚNG - NHẬN ƯU ĐÃI HẤP DẪN",
    subtitle: "Đăng ký thông tin để nhận thêm 1 lượt quay miễn phí!",
    maxSpins: 1,
    backgroundImageUrl: "https://w.ladicdn.com/66277f084a20840012743963/vong-xoay-20260601090429-wos5-.png",
    centerButtonUrl: "",
    rotationOffset: 0,
    showCouponText: true,
    fontSize: 13,
    textColor: "#ffffff",
    isBold: true,
    isItalic: false,
    items: [
      { id: "1", name: "Voucher Giảm 20%", code: "SPIN20", probability: 25, color: "#0d9488" },
      { id: "2", name: "Tặng Khám Miễn Phí", code: "FREEKHAM", probability: 20, color: "#0284c7" },
      { id: "3", name: "Giảm 50% Tẩy Trắng", code: "SPIN50", probability: 15, color: "#e11d48" },
      { id: "4", name: "Voucher 500K", code: "500KOFF", probability: 20, color: "#f59e0b" },
      { id: "5", name: "Tặng Nón Bảo Hiểm", code: "NONBH", probability: 10, color: "#8b5cf6" },
      { id: "6", name: "Miễn Phí Xe Đưa Đón", code: "XEDON", probability: 10, color: "#16a34a" },
    ],
  });

  // -------------------------------------------------------------
  // 7. CUSTOM CANVAS BUILDER CONFIG STATE
  // -------------------------------------------------------------
  const [canvasConfig, setCanvasConfig] = useState<CustomCanvasConfig>({
    title: "Vùng Canvas Khối Nội Dung Linh Hoạt",
    layout: "2_COL_EQUAL",
    bgColor: "#ffffff",
    paddingY: 32,
    borderRadius: 24,
    elements: [
      {
        id: "el_1",
        type: "BADGE",
        content: "DỊCH VỤ NỔI BẬT 2026",
        bgColor: "#0d9488",
        color: "#ffffff",
      },
      {
        id: "el_2",
        type: "HEADING",
        content: "Giải Pháp Vệ Sinh Chuyên Nghiệp Hàng Đầu",
        color: "#1c1917",
        fontSize: 26,
      },
      {
        id: "el_3",
        type: "TEXT",
        content: "Mang đến không gian sống sạch sẽ, thoáng mát và an toàn tuyệt đối cho sức khỏe gia đình bạn với quy trình hiện đại.",
        color: "#78716c",
        fontSize: 14,
      },
      {
        id: "el_4",
        type: "BUTTON",
        content: "ĐẶT LỊCH TƯ VẤN NGAY →",
        url: "tel:0901234567",
        bgColor: "#0d9488",
        color: "#ffffff",
      },
      {
        id: "el_5",
        type: "IMAGE",
        url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800",
        content: "Hình minh họa dịch vụ uy tín",
        borderRadius: 20,
      },
    ],
  });

  const fetchSavedBlocks = () => {
    fetch("/api/shortcode-blocks")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.blocks) {
          setSavedBlocks(data.blocks);
          const forms = data.blocks.filter((b: any) => b.type === "FORM");
          setFormBlocks(forms.length > 0 ? forms : data.blocks);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSavedBlocks();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Media Picker Trigger Callback
  const openMediaPicker = (targetType: string, slideIdx?: number) => {
    setMediaTarget({ type: targetType, slideIdx });
    setIsMediaModalOpen(true);
  };

  const handleSelectMediaImage = (url: string) => {
    if (!mediaTarget) return;

    if (mediaTarget.type === "pricing-banner-img") {
      setPricingConfig((prev) => ({
        ...prev,
        banner: { ...(prev.banner || { enabled: true }), imageUrl: url },
      }));
    } else if (mediaTarget.type === "pricing-bg-img") {
      setPricingConfig((prev) => ({ ...prev, bgImageUrl: url }));
    } else if (mediaTarget.type === "form-bg-img") {
      setFormConfig((prev) => ({ ...prev, bgImageUrl: url }));
    } else if (mediaTarget.type === "standalone-banner-img" || mediaTarget.type === "banner-bg-img") {
      setBannerConfig((prev) => ({ ...prev, imageUrl: url, bgImageUrl: url }));
    } else if (mediaTarget.type === "slider-bg-img") {
      setSliderConfig((prev) => ({ ...prev, bgImageUrl: url }));
    } else if (mediaTarget.type === "spin-wheel-bg") {
      setLuckySpinConfig((prev) => ({ ...prev, backgroundImageUrl: url }));
    } else if (mediaTarget.type === "spin-center-btn") {
      setLuckySpinConfig((prev) => ({ ...prev, centerButtonUrl: url }));
    } else if (mediaTarget.type === "canvas-bg") {
      setCanvasConfig((prev) => ({ ...prev, bgImageUrl: url }));
    } else if (mediaTarget.type === "slide-img" && typeof mediaTarget.slideIdx === "number") {
      updateSlideItem(mediaTarget.slideIdx, { imageUrl: url });
    }
    setIsMediaModalOpen(false);
  };

  const slugifyKey = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleBlockNameChange = (val: string) => {
    setBlockName(val);
    if (!editingId) {
      setBlockKey(slugifyKey(val));
    }
  };

  const handleSaveBlock = async () => {
    if (!blockName || !blockKey) {
      alert("Vui lòng nhập Tên Block và Mã nhận diện Key!");
      return;
    }

    setSaving(true);
    let configData: any = pricingConfig;
    if (blockType === "FORM") configData = formConfig;
    if (blockType === "BANNER") configData = bannerConfig;
    if (blockType === "BUTTON") configData = buttonConfig;
    if (blockType === "SLIDER" || blockType === "VOUCHER") configData = sliderConfig;
    if (blockType === "LUCKY_SPIN") configData = luckySpinConfig;
    if (blockType === "CUSTOM_CANVAS") configData = canvasConfig;

    try {
      const endpoint = editingId ? `/api/shortcode-blocks/${editingId}` : "/api/shortcode-blocks";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: blockName,
          key: blockKey,
          type: blockType,
          configJson: configData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg(editingId ? "✓ Đã cập nhật thông tin Block thành công!" : "✓ Đã lưu Visual Block vào Database thành công!");
        setEditingId(null);
        fetchSavedBlocks();
        setActiveTab("library");
      } else {
        alert("Lỗi: " + (data.error || "Lưu thất bại"));
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleDeleteSavedBlock = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa Block tùy biến này?")) return;
    await fetch(`/api/shortcode-blocks/${id}`, { method: "DELETE" });
    fetchSavedBlocks();
  };

  const handleLoadBlockForEdit = (block: SavedBlock) => {
    setEditingId(block.id);
    setBlockName(block.name);
    setBlockKey(block.key);
    setBlockType(block.type as any);

    try {
      const parsed = JSON.parse(block.configJson);
      if (block.type === "PRICING") setPricingConfig(parsed);
      if (block.type === "FORM") setFormConfig(parsed);
      if (block.type === "BANNER") setBannerConfig(parsed);
      if (block.type === "BUTTON") setButtonConfig(parsed);
      if (block.type === "SLIDER" || block.type === "VOUCHER") setSliderConfig(parsed);
      if (block.type === "LUCKY_SPIN") setLuckySpinConfig(parsed);
      if (block.type === "CUSTOM_CANVAS") setCanvasConfig(parsed);
    } catch {}

    setActiveTab("builder");
  };

  // -------------------------------------------------------------
  // PRICING COLUMNS BUILDER HELPERS
  // -------------------------------------------------------------
  const updatePricingColumn = (index: number, updated: Partial<PricingColumnConfig>) => {
    setPricingConfig((prev) => {
      const newCols = [...prev.columns];
      newCols[index] = { ...newCols[index], ...updated };
      return { ...prev, columns: newCols };
    });
  };

  const addPricingColumn = () => {
    if (pricingConfig.columns.length >= 4) {
      alert("Tối đa 4 cột báo giá!");
      return;
    }
    setPricingConfig((prev) => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          name: `Gói Mới ${prev.columns.length + 1}`,
          subtitle: "Gói Bổ Sung",
          price: "500.000đ",
          unit: "/lần",
          features: ["Tính năng 1", "Tính năng 2"],
          ctaText: "Đặt Ngay →",
          ctaUrl: "tel:0901234567",
        },
      ],
    }));
  };

  const removePricingColumn = (index: number) => {
    if (pricingConfig.columns.length <= 1) return;
    setPricingConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index),
    }));
  };

  const addColumnFeature = (colIdx: number) => {
    setPricingConfig((prev) => {
      const newCols = [...prev.columns];
      newCols[colIdx].features = [...newCols[colIdx].features, "Dịch vụ ưu đãi bổ sung"];
      return { ...prev, columns: newCols };
    });
  };

  const updateColumnFeature = (colIdx: number, featIdx: number, val: string) => {
    setPricingConfig((prev) => {
      const newCols = [...prev.columns];
      const newFeats = [...newCols[colIdx].features];
      newFeats[featIdx] = val;
      newCols[colIdx].features = newFeats;
      return { ...prev, columns: newCols };
    });
  };

  const removeColumnFeature = (colIdx: number, featIdx: number) => {
    setPricingConfig((prev) => {
      const newCols = [...prev.columns];
      newCols[colIdx].features = newCols[colIdx].features.filter((_, i) => i !== featIdx);
      return { ...prev, columns: newCols };
    });
  };

  // -------------------------------------------------------------
  // FORM FIELDS BUILDER HELPERS
  // -------------------------------------------------------------
  const addFormField = () => {
    const newId = `f_${Date.now()}`;
    setFormConfig((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id: newId,
          label: "Trường Dữ Liệu Mới",
          name: `field_${prev.fields.length + 1}`,
          type: "text",
          placeholder: "Nhập thông tin...",
          required: false,
        },
      ],
    }));
  };

  const updateFormField = (index: number, updated: Partial<FormFieldConfig>) => {
    setFormConfig((prev) => {
      const newFields = [...prev.fields];
      newFields[index] = { ...newFields[index], ...updated };
      return { ...prev, fields: newFields };
    });
  };

  const removeFormField = (index: number) => {
    if (formConfig.fields.length <= 1) return;
    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const moveFormField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formConfig.fields.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    setFormConfig((prev) => {
      const newFields = [...prev.fields];
      const temp = newFields[index];
      newFields[index] = newFields[targetIndex];
      newFields[targetIndex] = temp;
      return { ...prev, fields: newFields };
    });
  };

  // -------------------------------------------------------------
  // LUCKY SPIN FORM FIELD HELPERS
  // -------------------------------------------------------------
  const defaultLuckySpinFormFields: FormFieldConfig[] = [
    { id: "1", label: "Họ và tên *", name: "fullName", type: "text", placeholder: "VD: Nguyễn Văn A", required: true },
    { id: "2", label: "Số điện thoại *", name: "phone", type: "tel", placeholder: "VD: 0901 234 567", required: true },
    { id: "3", label: "Dịch vụ quan tâm", name: "service", type: "select", options: ["Lau dọn nhà cửa định kỳ", "Tổng vệ sinh căn hộ", "Vệ sinh sofa, nệm & thảm"], required: false },
  ];

  const addLuckySpinFormField = () => {
    const newId = `f_${Date.now()}`;
    const currentFields = luckySpinConfig.formFields?.length
      ? luckySpinConfig.formFields
      : defaultLuckySpinFormFields;
    setLuckySpinConfig((prev) => ({
      ...prev,
      formFields: [
        ...currentFields,
        {
          id: newId,
          label: "Trường Bổ Sung Mới",
          name: `field_${currentFields.length + 1}`,
          type: "text" as const,
          placeholder: "Nhập thông tin...",
          required: false,
        },
      ],
    }));
  };

  const updateLuckySpinFormField = (index: number, updated: Partial<FormFieldConfig>) => {
    const currentFields = luckySpinConfig.formFields?.length
      ? luckySpinConfig.formFields
      : defaultLuckySpinFormFields;
    const newFields = [...currentFields];
    newFields[index] = { ...newFields[index], ...updated };
    setLuckySpinConfig((prev) => ({ ...prev, formFields: newFields }));
  };

  const removeLuckySpinFormField = (index: number) => {
    const currentFields = luckySpinConfig.formFields?.length
      ? luckySpinConfig.formFields
      : defaultLuckySpinFormFields;
    setLuckySpinConfig((prev) => ({
      ...prev,
      formFields: currentFields.filter((_, i) => i !== index),
    }));
  };

  // -------------------------------------------------------------
  // CUSTOM CANVAS BUILDER HELPERS
  // -------------------------------------------------------------
  const addCanvasElement = (type: CustomCanvasElement["type"]) => {
    const newId = `el_${Date.now()}`;
    const newElement: CustomCanvasElement = {
      id: newId,
      type,
      content:
        type === "HEADING"
          ? "Tiêu Đề Canvas Mới"
          : type === "TEXT"
          ? "Nội dung đoạn văn linh hoạt..."
          : type === "BADGE"
          ? "NHÃN NỔI BẬT"
          : type === "BUTTON"
          ? "XEM CHI TIẾT →"
          : "Nội dung...",
      url:
        type === "IMAGE"
          ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800"
          : type === "VIDEO"
          ? "https://www.youtube.com/embed/dQw4w9WgXcQ"
          : type === "BUTTON"
          ? "tel:0901234567"
          : undefined,
      bgColor: type === "BUTTON" || type === "BADGE" ? "#0d9488" : undefined,
      color: type === "BUTTON" || type === "BADGE" ? "#ffffff" : undefined,
    };

    setCanvasConfig((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
  };

  const updateCanvasElement = (index: number, updated: Partial<CustomCanvasElement>) => {
    setCanvasConfig((prev) => {
      const newElements = [...prev.elements];
      newElements[index] = { ...newElements[index], ...updated };
      return { ...prev, elements: newElements };
    });
  };

  const removeCanvasElement = (index: number) => {
    setCanvasConfig((prev) => ({
      ...prev,
      elements: prev.elements.filter((_, i) => i !== index),
    }));
  };

  const moveCanvasElementUp = (index: number) => {
    if (index === 0) return;
    setCanvasConfig((prev) => {
      const arr = [...prev.elements];
      const temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
      return { ...prev, elements: arr };
    });
  };

  const moveCanvasElementDown = (index: number) => {
    if (index >= canvasConfig.elements.length - 1) return;
    setCanvasConfig((prev) => {
      const arr = [...prev.elements];
      const temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
      return { ...prev, elements: arr };
    });
  };

  // -------------------------------------------------------------
  // SLIDER BUILDER HELPERS
  // -------------------------------------------------------------
  const addSlideItem = () => {
    const newId = `slide_${Date.now()}`;
    setSliderConfig((prev) => ({
      ...prev,
      slides: [
        ...prev.slides,
        {
          id: newId,
          title: `Slide Mới ${prev.slides.length + 1}`,
          subtitle: "Mô tả ngắn slide",
          description: "Thông tin chi tiết khuyến mãi hoặc thông tin chuyên gia...",
          imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
          showCta: true,
          ctaText: "Xem chi tiết →",
          ctaUrl: "tel:0901234567",
        },
      ],
    }));
  };

  const updateSlideItem = (index: number, updated: Partial<SlideItemConfig>) => {
    setSliderConfig((prev) => {
      const newSlides = [...prev.slides];
      newSlides[index] = { ...newSlides[index], ...updated };
      return { ...prev, slides: newSlides };
    });
  };

  const removeSlideItem = (index: number) => {
    if (sliderConfig.slides.length <= 1) return;
    setSliderConfig((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
  };

  // -------------------------------------------------------------
  // LUCKY SPIN BUILDER HELPERS
  // -------------------------------------------------------------
  const addSpinItem = () => {
    const newId = `spin_${Date.now()}`;
    const defaultColors = ["#0d9488", "#0284c7", "#e11d48", "#f59e0b", "#8b5cf6", "#16a34a"];
    setLuckySpinConfig((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: newId,
          name: `Voucher Mới ${prev.items.length + 1}`,
          code: `MA${prev.items.length + 1}`,
          probability: 10,
          color: defaultColors[prev.items.length % defaultColors.length],
        },
      ],
    }));
  };

  const updateSpinItem = (index: number, updated: Partial<LuckySpinItem>) => {
    setLuckySpinConfig((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], ...updated };
      return { ...prev, items: newItems };
    });
  };

  const removeSpinItem = (index: number) => {
    if (luckySpinConfig.items.length <= 2) {
      alert("Cần tối thiểu 2 slice quà tặng cho Vòng Quay!");
      return;
    }
    setLuckySpinConfig((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const generatedShortcodeTag = `[block key="${blockKey}"]`;

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={handleSelectMediaImage}
      />

      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
        <div className="space-y-1 font-sans">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0d4f4a] uppercase tracking-wider">
            <Puzzle size={16} />
            <span>Trình Thiết Kế Visual Block Builder &amp; Shortcode Generator</span>
          </div>
          <h1 className="text-2xl font-extrabold font-serif text-stone-900">
            Tự Do Tạo &amp; Tùy Chỉnh Block / Nút CTA / Vòng Quay May Mắn
          </h1>
          <p className="text-xs text-stone-500 max-w-2xl">
            Tùy chọn màu sắc linh hoạt chi tiết từng phần, Vòng Quay May Mắn (Lucky Spin) tỉ lệ trúng thưởng tùy chỉnh, banner chia đôi 2 cột và dán mã shortcode tiện lợi!
          </p>
        </div>

        <div className="flex items-center gap-6 border-b border-stone-200 text-xs font-mono pt-2">
          <button
            onClick={() => setActiveTab("builder")}
            className={`pb-2.5 font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === "builder" ? "border-[#0d4f4a] text-[#0d4f4a]" : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            🎨 Visual Builder
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`pb-2.5 font-bold transition-all flex items-center gap-1 cursor-pointer border-b-2 ${
              activeTab === "library" ? "border-[#0d4f4a] text-[#0d4f4a]" : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            📚 Block Đã Lưu ({savedBlocks.length})
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* TAB 1: VISUAL BUILDER */}
      {/* --------------------------------------------------------- */}
      {activeTab === "builder" && (
        <div className="space-y-8">
          {/* Builder Controls & Live Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Controls Panel (5 Cols) */}
            <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <Sliders size={18} className="text-[#0d4f4a]" />
                  <span>Cấu Hình Chi Tiết Block</span>
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-lg bg-[#0d4f4a]/10 text-[#0d4f4a] border border-[#0d4f4a]/30">
                  {blockType}
                </span>
              </div>

              {/* General Metadata */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tên Block (Nhận diện nội bộ) *</label>
                  <input
                    type="text"
                    value={blockName}
                    onChange={(e) => handleBlockNameChange(e.target.value)}
                    placeholder="VD: Vòng Quay May Mắn 2026"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-medium focus:outline-none focus:border-[#0d9488]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Mã Shortcode Key *</label>
                    <input
                      type="text"
                      value={blockKey}
                      onChange={(e) => setBlockKey(e.target.value)}
                      placeholder="vong-quay-uu-dai-2026"
                      className="w-full px-3 py-2 font-mono text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Loại Block *</label>
                    <select
                      value={blockType}
                      onChange={(e) => setBlockType(e.target.value as any)}
                      className="w-full px-3 py-2 font-bold border border-stone-300 rounded-xl focus:outline-none focus:border-[#0d9488] bg-teal-50/50 text-[#0d9488]"
                    >
                      <option value="BANNER">📢 Banner Quảng Cáo</option>
                      <option value="SLIDER">🖼️ Banner Slide 3D</option>
                      <option value="VOUCHER">🎟️ Slide Vé Ưu Đãi 3D</option>
                      <option value="LUCKY_SPIN">🎡 Vòng Quay May Mắn</option>
                      <option value="PRICING">💰 Bảng Giá Dịch Vụ</option>
                      <option value="FORM">📝 Form Đăng Ký</option>
                      <option value="BUTTON">🔘 Khối Nút CTA</option>
                      <option value="CUSTOM_CANVAS">🎨 Khối Kéo Thả Tùy Chỉnh</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* TYPE 6: LUCKY SPIN BUILDER CONTROLS */}
              {/* ------------------------------------------------------------- */}
              {blockType === "LUCKY_SPIN" && (
                <div className="space-y-5 text-xs border-t pt-4">
                  {/* General Lucky Spin Settings */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Trophy size={14} className="text-amber-500" /> 1. Tiêu Đề &amp; Lượt Quay Tối Đa
                    </h4>

                    <input
                      type="text"
                      placeholder="Tiêu đề chính Vòng Quay..."
                      value={luckySpinConfig.title || ""}
                      onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Phụ đề / Gợi ý lượt quay..."
                      value={luckySpinConfig.subtitle || ""}
                      onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Số lượt quay tối đa</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={luckySpinConfig.maxSpins || 1}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, maxSpins: Number(e.target.value) }))}
                          className="w-full px-3 py-1.5 border border-stone-300 rounded-xl font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Xoay hình nền (deg)</label>
                        <input
                          type="number"
                          value={luckySpinConfig.rotationOffset || 0}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, rotationOffset: Number(e.target.value) }))}
                          className="w-full px-3 py-1.5 border border-stone-300 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Wheel Images Section */}
                  <div className="space-y-3 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200">
                    <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-amber-600" /> 2. Hình Ảnh Vòng Quay &amp; Nút Trung Tâm
                    </h4>

                    <div className="space-y-1">
                      <label className="block font-semibold text-amber-900">URL Ảnh Vòng Quay Wheel:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Link ảnh vòng quay..."
                          value={luckySpinConfig.backgroundImageUrl || ""}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, backgroundImageUrl: e.target.value }))}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaPicker("spin-wheel-bg")}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shrink-0 flex items-center gap-1 shadow-xs"
                        >
                          <ImageIcon size={13} /> + Thư Viện
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-amber-900">URL Nút Quay Trung Tâm (Pointer Needle):</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Link ảnh nút quay..."
                          value={luckySpinConfig.centerButtonUrl || ""}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, centerButtonUrl: e.target.value }))}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaPicker("spin-center-btn")}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shrink-0 flex items-center gap-1 shadow-xs"
                        >
                          <ImageIcon size={13} /> + Thư Viện
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Text & Style Formatting Settings */}
                  <div className="space-y-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Palette size={14} className="text-[#0d9488]" /> 3. Thiết Lập Chữ &amp; Định Dạng Font
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={luckySpinConfig.showCouponText !== false}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, showCouponText: e.target.checked }))}
                          className="rounded text-[#0d9488]"
                        />
                        <span>Hiện Chữ Coupon</span>
                      </label>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-[11px] font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={luckySpinConfig.isBold !== false}
                            onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, isBold: e.target.checked }))}
                            className="rounded text-[#0d9488]"
                          />
                          In đậm (B)
                        </label>
                        <label className="flex items-center gap-1 text-[11px] font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={luckySpinConfig.isItalic || false}
                            onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, isItalic: e.target.checked }))}
                            className="rounded text-[#0d9488]"
                          />
                          In nghiêng (I)
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Cỡ chữ (px)</label>
                        <input
                          type="number"
                          min={10}
                          max={24}
                          value={luckySpinConfig.fontSize || 13}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, fontSize: Number(e.target.value) }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg font-mono"
                        />
                      </div>
                      <ColorInput
                        label="Màu chữ Coupon"
                        value={luckySpinConfig.textColor || "#ffffff"}
                        onChange={(val) => setLuckySpinConfig((prev) => ({ ...prev, textColor: val }))}
                      />
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Offset Góc Quay (°)</label>
                        <input
                          type="number"
                          placeholder="VD: 0, 30, -30"
                          value={luckySpinConfig.rotationOffset || 0}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, rotationOffset: Number(e.target.value) }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg font-mono text-xs font-bold text-amber-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slices List Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                        4. Danh Sách Kết Quả Slices ({luckySpinConfig.items.length})
                      </h4>
                      <button
                        onClick={addSpinItem}
                        className="px-2.5 py-1 bg-teal-50 text-[#0d9488] font-bold rounded-lg border border-teal-200 hover:bg-teal-100 flex items-center gap-1"
                      >
                        <Plus size={13} /> Thêm Phần Thưởng
                      </button>
                    </div>

                    <div className="p-2.5 bg-teal-50/70 border border-teal-200 rounded-xl text-[11px] text-teal-900 leading-relaxed font-medium">
                      📌 <strong>Quy tắc thứ tự Slices:</strong> Thứ tự từ Slice 1 ➔ N được tính từ <strong>vị trí 12h theo chiều kim đồng hồ</strong>. Hãy nhập danh sách quà tặng trùng khớp với hình nền Vòng Quay custom của bạn!
                    </div>

                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                      {luckySpinConfig.items.map((item, idx) => (
                        <div key={item.id || idx} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0d9488]">
                              Slice #{idx + 1} {idx === 0 ? "(Vị trí 1 - 12h Đỉnh)" : `(Vị trí ${idx + 1} - Chiều kim đồng hồ)`}:
                            </span>
                            {luckySpinConfig.items.length > 2 && (
                              <button onClick={() => removeSpinItem(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Tên phần thưởng (VD: Voucher 20%)..."
                              value={item.name}
                              onChange={(e) => updateSpinItem(idx, { name: e.target.value })}
                              className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Mã Coupon (VD: SPIN20)..."
                              value={item.code}
                              onChange={(e) => updateSpinItem(idx, { code: e.target.value })}
                              className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-[#0d9488]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Tỉ lệ % trúng</label>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={item.probability}
                                onChange={(e) => updateSpinItem(idx, { probability: Number(e.target.value) })}
                                className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold"
                              />
                            </div>
                            <ColorInput
                              label="Màu Slice"
                              value={item.color || "#0d9488"}
                              onChange={(val) => updateSpinItem(idx, { color: val })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Card Customization Settings */}
                  <div className="space-y-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Palette size={14} className="text-[#0d9488]" /> 5. Tùy Chỉnh Form Đăng Ký (Text &amp; Màu Sắc)
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Text Nhãn Badge</label>
                        <input
                          type="text"
                          placeholder="🎁 ƯU ĐÃI ĐẶC BIỆT"
                          value={luckySpinConfig.formBadgeText || ""}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, formBadgeText: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <ColorInput
                        label="Màu Chữ Badge"
                        value={luckySpinConfig.formBadgeColor || "#0d9488"}
                        onChange={(val) => setLuckySpinConfig((prev) => ({ ...prev, formBadgeColor: val }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Tiêu Đề Form Đăng Ký</label>
                        <input
                          type="text"
                          placeholder="ĐẶT LỊCH TƯ VẤN MIỄN PHÍ NGAY HÔM NAY!"
                          value={luckySpinConfig.formTitle || ""}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, formTitle: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <ColorInput
                        label="Màu Chữ Tiêu Đề Form"
                        value={luckySpinConfig.formTitleColor || "#1c1917"}
                        onChange={(val) => setLuckySpinConfig((prev) => ({ ...prev, formTitleColor: val }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Text Subtitle Mô Tả</label>
                        <input
                          type="text"
                          placeholder="Nhập thông tin để nhận thêm 1 lượt quay..."
                          value={luckySpinConfig.formSubtitle || ""}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, formSubtitle: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <ColorInput
                        label="Màu Chữ Subtitle"
                        value={luckySpinConfig.formSubtitleColor || "#78716c"}
                        onChange={(val) => setLuckySpinConfig((prev) => ({ ...prev, formSubtitleColor: val }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <ColorInput
                        label="Màu Nền Khung Card Form"
                        value={luckySpinConfig.formBgColor || "#ffffff"}
                        onChange={(val) => setLuckySpinConfig((prev) => ({ ...prev, formBgColor: val }))}
                      />
                      <ColorInput
                        label="Màu Chữ Nhãn Đầu Vào (Labels)"
                        value={luckySpinConfig.formLabelColor || "#44403c"}
                        onChange={(val) => setLuckySpinConfig((prev) => ({ ...prev, formLabelColor: val }))}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1 border-t">
                      <div className="col-span-3">
                        <label className="block font-bold text-stone-700 mb-1">Text Nút Bấm CTA Form</label>
                        <input
                          type="text"
                          placeholder="ĐĂNG KÝ & QUAY VÒNG QUAY NGAY"
                          value={luckySpinConfig.formButtonText || ""}
                          onChange={(e) => setLuckySpinConfig((prev) => ({ ...prev, formButtonText: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold uppercase text-amber-600"
                        />
                      </div>
                      <ColorInput
                        label="Màu Nền Nút CTA"
                        value={luckySpinConfig.formButtonBg || "#f59e0b"}
                        onChange={(val) => setLuckySpinConfig((prev) => ({ ...prev, formButtonBg: val }))}
                      />
                      <ColorInput
                        label="Màu Chữ Nút CTA"
                        value={luckySpinConfig.formButtonTextColor || "#ffffff"}
                        onChange={(val) => setLuckySpinConfig((prev) => ({ ...prev, formButtonTextColor: val }))}
                      />
                    </div>
                  </div>

                  {/* Form Input Fields Manager (Add/Remove/Custom Fields) */}
                  <div className="space-y-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Plus size={14} className="text-[#0d9488]" /> 6. Quản Lý Các Trường Ô Nhập Form ({(luckySpinConfig.formFields || defaultLuckySpinFormFields).length})
                      </h4>
                      <button
                        type="button"
                        onClick={addLuckySpinFormField}
                        className="px-2.5 py-1 bg-teal-50 text-[#0d9488] font-bold rounded-lg border border-teal-200 hover:bg-teal-100 flex items-center gap-1 text-[11px]"
                      >
                        <Plus size={13} /> Thêm Trường Ô Nhập
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {(luckySpinConfig.formFields || defaultLuckySpinFormFields).map((field, fIdx) => (
                        <div key={field.id || fIdx} className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0d9488]">Trường #{fIdx + 1}: {field.label}</span>
                            <button
                              type="button"
                              onClick={() => removeLuckySpinFormField(fIdx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Tên Nhãn (Label)</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateLuckySpinFormField(fIdx, { label: e.target.value })}
                                className="w-full px-2.5 py-1 bg-stone-50 border border-stone-300 rounded text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Tên Biến (Name Key)</label>
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => updateLuckySpinFormField(fIdx, { name: e.target.value })}
                                className="w-full px-2.5 py-1 bg-stone-50 border border-stone-300 rounded text-xs font-mono text-teal-700"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Loại Trường</label>
                              <select
                                value={field.type}
                                onChange={(e) => updateLuckySpinFormField(fIdx, { type: e.target.value as any })}
                                className="w-full px-2.5 py-1 bg-stone-50 border border-stone-300 rounded text-xs font-bold"
                              >
                                <option value="text">Văn bản (Text)</option>
                                <option value="tel">Số điện thoại (Tel)</option>
                                <option value="email">Email</option>
                                <option value="select">Danh sách Lựa chọn (Select)</option>
                                <option value="textarea">Văn bản dài (Textarea)</option>
                                <option value="date">Ngày tháng (Date)</option>
                              </select>
                            </div>
                            <div className="flex items-center pt-4">
                              <label className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required !== false}
                                  onChange={(e) => updateLuckySpinFormField(fIdx, { required: e.target.checked })}
                                  className="rounded text-[#0d9488]"
                                />
                                <span>Bắt buộc nhập (Required)</span>
                              </label>
                            </div>
                          </div>

                          {field.type === "select" && (
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Tùy chọn Select (Phân cách bằng dấu phẩy)</label>
                              <input
                                type="text"
                                placeholder="Dịch vụ A, Dịch vụ B, Dịch vụ C..."
                                value={field.options?.join(", ") || ""}
                                onChange={(e) =>
                                  updateLuckySpinFormField(fIdx, {
                                    options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                                  })
                                }
                                className="w-full px-2.5 py-1 bg-stone-50 border border-stone-300 rounded text-xs"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TYPE 7: CUSTOM CANVAS DRAG & DROP BUILDER CONTROLS */}
              {/* ------------------------------------------------------------- */}
              {blockType === "CUSTOM_CANVAS" && (
                <div className="space-y-5 text-xs border-t pt-4">
                  {/* General Canvas Settings */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <LayoutGrid size={14} className="text-[#0d9488]" /> 1. Cấu Hình Khung &amp; Chia Cột Layout
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Kiểu Layout Chia Cột</label>
                        <select
                          value={canvasConfig.layout || "2_COL_EQUAL"}
                          onChange={(e) => setCanvasConfig((prev) => ({ ...prev, layout: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold text-xs"
                        >
                          <option value="1_COL">1 Cột Dọc Dãy Dài (Single Column)</option>
                          <option value="2_COL_EQUAL">2 Cột Bằng Nhau 50 / 50</option>
                          <option value="2_COL_SPLIT">2 Cột Lệch 5 Cột / 7 Cột</option>
                          <option value="3_COL">3 Cột Đều Nhanh Nối Tiếp</option>
                          <option value="4_COL">4 Cột Thẻ Lưới Grid</option>
                        </select>
                      </div>

                      <ColorInput
                        label="Màu Nền Khung Canvas"
                        value={canvasConfig.bgColor || "#ffffff"}
                        onChange={(val) => setCanvasConfig((prev) => ({ ...prev, bgColor: val }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Ảnh Nền Background (URL / Upload)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://domain.com/background.jpg"
                            value={canvasConfig.bgImageUrl || ""}
                            onChange={(e) => setCanvasConfig((prev) => ({ ...prev, bgImageUrl: e.target.value }))}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker("canvas-bg")}
                            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl whitespace-nowrap flex items-center gap-1 text-xs"
                          >
                            <ImageIcon size={13} /> + Thư Viện
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Khoảng Cách Padding Trên/Dưới (px)</label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={canvasConfig.paddingY ?? 32}
                          onChange={(e) => setCanvasConfig((prev) => ({ ...prev, paddingY: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add Elements Toolbar */}
                  <div className="space-y-2 p-3 bg-[#0d4f4a]/5 rounded-2xl border border-[#0d4f4a]/20">
                    <h4 className="font-bold text-[#0d4f4a] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Plus size={14} /> 2. Thêm Phần Tử Vào Canvas (+ Drag/Reorder Elements)
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => addCanvasElement("HEADING")}
                        className="px-2.5 py-1.5 bg-white border border-stone-300 hover:border-[#0d9488] hover:text-[#0d9488] font-bold rounded-xl shadow-sm text-xs flex items-center gap-1"
                      >
                        <Plus size={12} /> + Tiêu Đề
                      </button>
                      <button
                        type="button"
                        onClick={() => addCanvasElement("TEXT")}
                        className="px-2.5 py-1.5 bg-white border border-stone-300 hover:border-[#0d9488] hover:text-[#0d9488] font-bold rounded-xl shadow-sm text-xs flex items-center gap-1"
                      >
                        <Plus size={12} /> + Đoạn Văn
                      </button>
                      <button
                        type="button"
                        onClick={() => addCanvasElement("BADGE")}
                        className="px-2.5 py-1.5 bg-white border border-stone-300 hover:border-[#0d9488] hover:text-[#0d9488] font-bold rounded-xl shadow-sm text-xs flex items-center gap-1"
                      >
                        <Plus size={12} /> + Badge Nhãn
                      </button>
                      <button
                        type="button"
                        onClick={() => addCanvasElement("BUTTON")}
                        className="px-2.5 py-1.5 bg-white border border-stone-300 hover:border-[#0d9488] hover:text-[#0d9488] font-bold rounded-xl shadow-sm text-xs flex items-center gap-1"
                      >
                        <Plus size={12} /> + Nút CTA
                      </button>
                      <button
                        type="button"
                        onClick={() => addCanvasElement("IMAGE")}
                        className="px-2.5 py-1.5 bg-white border border-stone-300 hover:border-[#0d9488] hover:text-[#0d9488] font-bold rounded-xl shadow-sm text-xs flex items-center gap-1"
                      >
                        <Plus size={12} /> + Hình Ảnh
                      </button>
                      <button
                        type="button"
                        onClick={() => addCanvasElement("VIDEO")}
                        className="px-2.5 py-1.5 bg-white border border-stone-300 hover:border-[#0d9488] hover:text-[#0d9488] font-bold rounded-xl shadow-sm text-xs flex items-center gap-1"
                      >
                        <Plus size={12} /> + Video Embed
                      </button>
                    </div>
                  </div>

                  {/* Elements Reorder & Property Inspector */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                      3. Danh Sách Phần Tử Canvas ({canvasConfig.elements.length})
                    </h4>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {canvasConfig.elements.map((el, index) => (
                        <div key={el.id} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-[#0d9488] text-white font-mono font-bold rounded text-[10px]">
                                #{index + 1} {el.type}
                              </span>
                              <span className="font-bold text-stone-800 text-xs truncate max-w-[180px]">
                                {el.content || el.url || "Phần tử"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveCanvasElementUp(index)}
                                disabled={index === 0}
                                className="p-1 text-stone-500 hover:text-stone-800 disabled:opacity-30"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => moveCanvasElementDown(index)}
                                disabled={index >= canvasConfig.elements.length - 1}
                                className="p-1 text-stone-500 hover:text-stone-800 disabled:opacity-30"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCanvasElement(index)}
                                className="p-1 text-rose-500 hover:text-rose-700 ml-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Nội Dung Text / Tiêu Đề</label>
                              <input
                                type="text"
                                value={el.content || ""}
                                onChange={(e) => updateCanvasElement(index, { content: e.target.value })}
                                className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                                {el.type === "VIDEO"
                                  ? "Dán Link Video (YouTube, TikTok, FB Reels, MP4...)"
                                  : "Link URL / Image URL"}
                              </label>
                              <input
                                type="text"
                                placeholder={
                                  el.type === "VIDEO"
                                    ? "VD: https://www.youtube.com/watch?v=... hoặc Shorts / TikTok / Reels"
                                    : "https://..."
                                }
                                value={el.url || ""}
                                onChange={(e) => updateCanvasElement(index, { url: e.target.value })}
                                className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded text-xs font-mono text-teal-700"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <ColorInput
                              label="Màu Chữ"
                              value={el.color || "#1c1917"}
                              onChange={(val) => updateCanvasElement(index, { color: val })}
                            />
                            <ColorInput
                              label="Màu Nền"
                              value={el.bgColor || "#0d9488"}
                              onChange={(val) => updateCanvasElement(index, { bgColor: val })}
                            />
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Căn Lề</label>
                              <select
                                value={el.align || "left"}
                                onChange={(e) => updateCanvasElement(index, { align: e.target.value as any })}
                                className="w-full px-2 py-1 bg-white border border-stone-300 rounded text-xs"
                              >
                                <option value="left">Trái (Left)</option>
                                <option value="center">Giữa (Center)</option>
                                <option value="right">Phải (Right)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 1. PRICING TABLE BUILDER CONTROLS */}
              {blockType === "PRICING" && (
                <div className="space-y-5 text-xs border-t pt-4">
                  {/* Background & Frame */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-[#0d9488]" /> 1. Khung &amp; Background Bảng Giá
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <ColorInput
                        label="Màu Nền Background Khung"
                        value={pricingConfig.customColors?.bg}
                        onChange={(val) =>
                          setPricingConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), bg: val },
                          }))
                        }
                      />
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Ảnh Nền Background (URL / Upload)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://..."
                            value={pricingConfig.bgImageUrl || ""}
                            onChange={(e) => setPricingConfig((prev) => ({ ...prev, bgImageUrl: e.target.value }))}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker("pricing-bg-img")}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg whitespace-nowrap text-xs"
                          >
                            + Viện
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Header Title & Subtitle Colors */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">2. Tiêu Đề &amp; Màu Chữ Header</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Tiêu Đề Bảng Giá</label>
                        <input
                          type="text"
                          placeholder="Báo Giá Dịch Vụ..."
                          value={pricingConfig.title || ""}
                          onChange={(e) => setPricingConfig((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <ColorInput
                        label="Màu Chữ Tiêu Đề"
                        value={pricingConfig.customColors?.titleColor}
                        onChange={(val) =>
                          setPricingConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), titleColor: val },
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Mô Tả Subtitle</label>
                        <input
                          type="text"
                          placeholder="Bảng giá tham khảo minh bạch..."
                          value={pricingConfig.subtitle || ""}
                          onChange={(e) => setPricingConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <ColorInput
                        label="Màu Chữ Subtitle"
                        value={pricingConfig.customColors?.textColor}
                        onChange={(val) =>
                          setPricingConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), textColor: val },
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Pricing Cards Colors */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">3. Màu Nút CTA, Giá Tiền &amp; Đường Viền Card Tiêu Chuẩn</h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <ColorInput
                        label="Màu Nút Bấm CTA"
                        value={pricingConfig.customColors?.buttonBg}
                        onChange={(val) =>
                          setPricingConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), buttonBg: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Chữ Nút Bấm"
                        value={pricingConfig.customColors?.buttonText}
                        onChange={(val) =>
                          setPricingConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), buttonText: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Chữ Giá Tiền"
                        value={pricingConfig.customColors?.priceColor}
                        onChange={(val) =>
                          setPricingConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), priceColor: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Đường Viền Card"
                        value={pricingConfig.customColors?.borderColor}
                        onChange={(val) =>
                          setPricingConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), borderColor: val },
                          }))
                        }
                      />
                    </div>

                    {/* USER REQUIREMENT: HIGHLIGHT CARD CUSTOM COLORS (GÓI BÁN CHẠY NHẤT) */}
                    <div className="pt-3 border-t border-stone-200 space-y-2.5">
                      <h5 className="font-extrabold text-teal-800 text-xs flex items-center gap-1.5">
                        <Sparkles size={14} className="text-teal-600" />
                        <span>MÀU SẮC RIÊNG CHO GÓI BÁN CHẠY (HIGHLIGHT CARD):</span>
                      </h5>
                      <div className="grid grid-cols-2 gap-2.5">
                        <ColorInput
                          label="Màu Nền Card Bán Chạy"
                          value={pricingConfig.customColors?.highlightBg}
                          onChange={(val) =>
                            setPricingConfig((prev) => ({
                              ...prev,
                              customColors: { ...(prev.customColors || {}), highlightBg: val },
                            }))
                          }
                        />
                        <ColorInput
                          label="Màu Chữ Card Bán Chạy"
                          value={pricingConfig.customColors?.highlightText}
                          onChange={(val) =>
                            setPricingConfig((prev) => ({
                              ...prev,
                              customColors: { ...(prev.customColors || {}), highlightText: val },
                            }))
                          }
                        />
                        <ColorInput
                          label="Màu Giá Tiền Card Bán Chạy"
                          value={pricingConfig.customColors?.highlightPriceColor}
                          onChange={(val) =>
                            setPricingConfig((prev) => ({
                              ...prev,
                              customColors: { ...(prev.customColors || {}), highlightPriceColor: val },
                            }))
                          }
                        />
                        <ColorInput
                          label="Màu Viền Card Bán Chạy"
                          value={pricingConfig.customColors?.highlightBorderColor}
                          onChange={(val) =>
                            setPricingConfig((prev) => ({
                              ...prev,
                              customColors: { ...(prev.customColors || {}), highlightBorderColor: val },
                            }))
                          }
                        />
                        <ColorInput
                          label="Màu Nền Nút Bán Chạy"
                          value={pricingConfig.customColors?.highlightButtonBg}
                          onChange={(val) =>
                            setPricingConfig((prev) => ({
                              ...prev,
                              customColors: { ...(prev.customColors || {}), highlightButtonBg: val },
                            }))
                          }
                        />
                        <ColorInput
                          label="Màu Chữ Nút Bán Chạy"
                          value={pricingConfig.customColors?.highlightButtonText}
                          onChange={(val) =>
                            setPricingConfig((prev) => ({
                              ...prev,
                              customColors: { ...(prev.customColors || {}), highlightButtonText: val },
                            }))
                          }
                        />
                        <ColorInput
                          label="Màu Nền Huy Hiệu Bán Chạy"
                          value={pricingConfig.customColors?.highlightBadgeBg}
                          onChange={(val) =>
                            setPricingConfig((prev) => ({
                              ...prev,
                              customColors: { ...(prev.customColors || {}), highlightBadgeBg: val },
                            }))
                          }
                        />
                        <ColorInput
                          label="Màu Chữ Huy Hiệu Bán Chạy"
                          value={pricingConfig.customColors?.highlightBadgeText}
                          onChange={(val) =>
                            setPricingConfig((prev) => ({
                              ...prev,
                              customColors: { ...(prev.customColors || {}), highlightBadgeText: val },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Top Promo Banner Section */}
                  <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Flame size={14} className="text-amber-600" /> 4. Banner Khuyến Mãi Đầu Bảng Giá
                      </h4>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pricingConfig.banner?.enabled || false}
                          onChange={(e) =>
                            setPricingConfig((prev) => ({
                              ...prev,
                              banner: { ...(prev.banner || { enabled: false }), enabled: e.target.checked },
                            }))
                          }
                          className="rounded border-stone-300 text-teal-600"
                        />
                        <span>Bật Banner Đầu Bảng Giá</span>
                      </label>
                    </div>

                    {pricingConfig.banner?.enabled && (
                      <div className="space-y-3 pt-2 border-t border-amber-200/60">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">Badge Banner</label>
                            <input
                              type="text"
                              placeholder="ƯU ĐÃI THÁNG NÀY"
                              value={pricingConfig.banner.badge || ""}
                              onChange={(e) =>
                                setPricingConfig((prev) => ({
                                  ...prev,
                                  banner: { ...prev.banner!, badge: e.target.value },
                                }))
                              }
                              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-amber-700"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">Ảnh Banner (URL / Upload)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="https://..."
                                value={pricingConfig.banner.imageUrl || ""}
                                onChange={(e) =>
                                  setPricingConfig((prev) => ({
                                    ...prev,
                                    banner: { ...prev.banner!, imageUrl: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => openMediaPicker("pricing-banner-img")}
                                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg whitespace-nowrap text-xs"
                              >
                                + Viện
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Tiêu Đề Banner Headline</label>
                          <input
                            type="text"
                            placeholder="Giảm Ngay 20% Cho Đơn Hàng Đầu Tiên"
                            value={pricingConfig.banner.headline || ""}
                            onChange={(e) =>
                              setPricingConfig((prev) => ({
                                ...prev,
                                banner: { ...prev.banner!, headline: e.target.value },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Mô Tả Subtitle Banner</label>
                          <input
                            type="text"
                            placeholder="Nhập mã LUOI20OFF khi liên hệ..."
                            value={pricingConfig.banner.subtitle || ""}
                            onChange={(e) =>
                              setPricingConfig((prev) => ({
                                ...prev,
                                banner: { ...prev.banner!, subtitle: e.target.value },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">Text Nút CTA Banner Bảng Giá</label>
                            <input
                              type="text"
                              placeholder="Gọi Hotline Ngay →"
                              value={pricingConfig.banner.ctaText || ""}
                              onChange={(e) =>
                                setPricingConfig((prev) => ({
                                  ...prev,
                                  banner: { ...prev.banner!, ctaText: e.target.value },
                                }))
                              }
                              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-teal-700"
                            />
                          </div>
                          <CtaLinkInput
                            label="Hành Động Khi Click Nút Banner Bảng Giá"
                            value={pricingConfig.banner.ctaUrl || ""}
                            onChange={(val) =>
                              setPricingConfig((prev) => ({
                                ...prev,
                                banner: { ...prev.banner!, ctaUrl: val },
                              }))
                            }
                            formBlocks={formBlocks}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. PRICING COLUMNS MANAGER */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Tag size={14} className="text-[#0d9488]" /> 5. Quản Lý Các Cột Giá ({pricingConfig.columns.length} cột)
                      </h4>
                      <button
                        type="button"
                        onClick={addPricingColumn}
                        className="px-3 py-1 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs"
                      >
                        + Thêm Cột Mới
                      </button>
                    </div>

                    <div className="space-y-4">
                      {pricingConfig.columns.map((col, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3 relative">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-mono flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span>Cột Giá #{idx + 1}: {col.name}</span>
                            </span>

                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1 text-[11px] font-bold text-teal-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={col.isHighlighted || false}
                                  onChange={(e) => updatePricingColumn(idx, { isHighlighted: e.target.checked })}
                                  className="rounded border-stone-300 text-teal-600"
                                />
                                <span>Gói Bán Chạy (Highlight)</span>
                              </label>

                              {pricingConfig.columns.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePricingColumn(idx)}
                                  className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                                  title="Xóa cột này"
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Tên Gói</label>
                              <input
                                type="text"
                                value={col.name || ""}
                                onChange={(e) => updatePricingColumn(idx, { name: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Subtitle Mô Tả</label>
                              <input
                                type="text"
                                value={col.subtitle || ""}
                                onChange={(e) => updatePricingColumn(idx, { subtitle: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Giá Tiền</label>
                              <input
                                type="text"
                                value={col.price || ""}
                                onChange={(e) => updatePricingColumn(idx, { price: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono font-bold text-teal-700"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Đơn Vị Tính</label>
                              <input
                                type="text"
                                value={col.unit || ""}
                                onChange={(e) => updatePricingColumn(idx, { unit: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Badge Nhãn</label>
                              <input
                                type="text"
                                placeholder="BÁN CHẠY NHẤT"
                                value={col.badgeText || ""}
                                onChange={(e) => updatePricingColumn(idx, { badgeText: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-amber-700"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Text Nút CTA Cột Báo Giá</label>
                              <input
                                type="text"
                                value={col.ctaText || ""}
                                onChange={(e) => updatePricingColumn(idx, { ctaText: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-teal-700"
                              />
                            </div>
                            <CtaLinkInput
                              label="Hành Động Khi Click Nút Cột Báo Giá"
                              value={col.ctaUrl || ""}
                              onChange={(val) => updatePricingColumn(idx, { ctaUrl: val })}
                              formBlocks={formBlocks}
                            />
                          </div>

                          {/* Features List */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <label className="block text-[10px] font-bold text-stone-600">Danh Sách Tính Năng Dịch Vụ ({col.features.length})</label>
                              <button
                                type="button"
                                onClick={() => addColumnFeature(idx)}
                                className="text-[10px] font-bold text-teal-700 hover:underline"
                              >
                                + Thêm Dòng Tính Năng
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {col.features.map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-1.5">
                                  <span className="text-teal-600 font-bold text-[10px]">✓</span>
                                  <input
                                    type="text"
                                    value={feat}
                                    onChange={(e) => updateColumnFeature(idx, fIdx, e.target.value)}
                                    className="w-full px-2 py-1 border border-stone-200 rounded text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeColumnFeature(idx, fIdx)}
                                    className="text-stone-400 hover:text-rose-600 p-1"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. FORM BUILDER CONTROLS */}
              {blockType === "FORM" && (
                <div className="space-y-5 text-xs border-t pt-4">
                  {/* Background & Colors */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Palette size={14} className="text-[#0d9488]" /> 1. Khung &amp; Màu Sắc Form
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <ColorInput
                        label="Màu Nền Khung Form (Bg Color)"
                        value={formConfig.customColors?.bg}
                        onChange={(val) =>
                          setFormConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), bg: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Viền Border Khung Form"
                        value={formConfig.customColors?.borderColor}
                        onChange={(val) =>
                          setFormConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), borderColor: val },
                          }))
                        }
                      />
                      <div className="col-span-2">
                        <label className="block font-bold text-stone-700 mb-1">Ảnh Nền Background Form (URL / Upload)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://..."
                            value={formConfig.bgImageUrl || ""}
                            onChange={(e) => setFormConfig((prev) => ({ ...prev, bgImageUrl: e.target.value }))}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker("form-bg-img")}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg whitespace-nowrap text-xs cursor-pointer"
                          >
                            + Viện Media
                          </button>
                        </div>
                      </div>
                      <ColorInput
                        label="Màu Chữ Tiêu Đề Form"
                        value={formConfig.customColors?.titleColor}
                        onChange={(val) =>
                          setFormConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), titleColor: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Chữ Subtitle Mô Tả"
                        value={formConfig.customColors?.textColor}
                        onChange={(val) =>
                          setFormConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), textColor: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Nền Nút CTA Gửi"
                        value={formConfig.customColors?.buttonBg}
                        onChange={(val) =>
                          setFormConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), buttonBg: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Chữ Nút CTA Gửi"
                        value={formConfig.customColors?.buttonText}
                        onChange={(val) =>
                          setFormConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), buttonText: val },
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Header Text & Submit CTA */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">2. Nội Dung Text &amp; Nút Gửi CTA</h4>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Nhãn Badge Form</label>
                      <input
                        type="text"
                        placeholder="FORM TƯƠNG TÁC TÙY BIẾN"
                        value={formConfig.badge || ""}
                        onChange={(e) => setFormConfig((prev) => ({ ...prev, badge: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-teal-700 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Tiêu Đề Chính Form</label>
                      <input
                        type="text"
                        placeholder="Đăng Ký Tư Vấn..."
                        value={formConfig.title || ""}
                        onChange={(e) => setFormConfig((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Mô Tả Subtitle Form</label>
                      <input
                        type="text"
                        placeholder="Để lại thông tin..."
                        value={formConfig.subtitle || ""}
                        onChange={(e) => setFormConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Text Nút Bấm Gửi Form CTA</label>
                      <input
                        type="text"
                        placeholder="GỬI ĐĂNG KÝ NGAY"
                        value={formConfig.submitText || ""}
                        onChange={(e) => setFormConfig((prev) => ({ ...prev, submitText: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold uppercase text-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-emerald-700 mb-1">Mô Tả Lời Cảm Ơn Sau Khi Gửi Thành Công</label>
                      <input
                        type="text"
                        placeholder="Đăng Ký Thành Công! Chuyên viên sẽ liên hệ hỗ trợ bạn trong 15 phút."
                        value={formConfig.successMsg || ""}
                        onChange={(e) => setFormConfig((prev) => ({ ...prev, successMsg: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-emerald-300 rounded-lg text-xs text-emerald-800 bg-emerald-50/50"
                      />
                    </div>
                  </div>

                  {/* USER REQUIREMENT: BỐ CỤC FORM & XÁC MINH ANTI-SPAM */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Layout size={14} className="text-[#0d9488]" /> Bố Cục Hiển Thị Form &amp; Xác Minh Anti-Spam
                    </h4>

                    <div className="space-y-2">
                      <label className="block font-bold text-stone-700">Dạng Bố Cục Form:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormConfig((prev) => ({ ...prev, layout: "1_COL" }))}
                          className={`p-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                            (formConfig.layout || "2_COL") === "1_COL"
                              ? "bg-[#0d9488] text-white border-[#0d9488]"
                              : "bg-white text-stone-700 border-stone-300"
                          }`}
                        >
                          <span>Dạng 1 Cột</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormConfig((prev) => ({ ...prev, layout: "2_COL" }))}
                          className={`p-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                            (formConfig.layout || "2_COL") === "2_COL"
                              ? "bg-[#0d9488] text-white border-[#0d9488]"
                              : "bg-white text-stone-700 border-stone-300"
                          }`}
                        >
                          <span>Dạng 2 Cột</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormConfig((prev) => ({ ...prev, layout: "SPLIT_IMAGE_FORM" }))}
                          className={`p-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                            formConfig.layout === "SPLIT_IMAGE_FORM"
                              ? "bg-[#0d9488] text-white border-[#0d9488]"
                              : "bg-white text-stone-700 border-stone-300"
                          }`}
                        >
                          <span>Chia Đôi (Ảnh + Form)</span>
                        </button>
                      </div>
                    </div>

                    {formConfig.layout === "SPLIT_IMAGE_FORM" && (
                      <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-3 pt-2">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Ảnh Banner Bên Cạnh Form (URL / Upload)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://..."
                              value={formConfig.sideImageUrl || ""}
                              onChange={(e) => setFormConfig((prev) => ({ ...prev, sideImageUrl: e.target.value }))}
                              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => openMediaPicker("form-side-img")}
                              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg whitespace-nowrap text-xs cursor-pointer"
                            >
                              + Viện
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Vị Trí Ảnh Banner:</label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                              <input
                                type="radio"
                                name="sideImagePos"
                                checked={(formConfig.sideImagePos || "left") === "left"}
                                onChange={() => setFormConfig((prev) => ({ ...prev, sideImagePos: "left" }))}
                              />
                              <span>Nằm Bên Trái Form</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                              <input
                                type="radio"
                                name="sideImagePos"
                                checked={formConfig.sideImagePos === "right"}
                                onChange={() => setFormConfig((prev) => ({ ...prev, sideImagePos: "right" }))}
                              />
                              <span>Nằm Bên Phải Form</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Anti-Spam Verification Controls */}
                    <div className="pt-2 border-t border-stone-200 space-y-2">
                      <label className="flex items-center gap-2 font-bold text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formConfig.antiSpamEnabled || false}
                          onChange={(e) => setFormConfig((prev) => ({ ...prev, antiSpamEnabled: e.target.checked }))}
                          className="w-4 h-4 rounded border-stone-300 text-[#0d9488]"
                        />
                        <span>Bật Tùy Chọn Xác Minh Chống Spam (Anti-Spam Bot Verification)</span>
                      </label>

                      {formConfig.antiSpamEnabled && (
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Text Nhãn Ô Xác Minh Chống Spam</label>
                          <input
                            type="text"
                            placeholder="Tôi xác minh không phải là robot (Xác minh chống Spam)"
                            value={formConfig.antiSpamText || ""}
                            onChange={(e) => setFormConfig((prev) => ({ ...prev, antiSpamText: e.target.value }))}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. FORM FIELDS MANAGER */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <FormInput size={14} className="text-[#0d9488]" /> 3. Quản Lý Các Trường Ô Nhập ({formConfig.fields.length} trường)
                      </h4>
                      <button
                        type="button"
                        onClick={addFormField}
                        className="px-3 py-1 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs"
                      >
                        + Thêm Trường Ô Nhập
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formConfig.fields.map((field, idx) => (
                        <div key={field.id || idx} className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-mono text-[10px] flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-stone-900 text-xs">Trường #{idx + 1}: {field.label}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Reorder Buttons (USER REQUIREMENT) */}
                              <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                                <button
                                  type="button"
                                  onClick={() => moveFormField(idx, "up")}
                                  disabled={idx === 0}
                                  className="p-1 text-stone-600 hover:bg-stone-200 disabled:opacity-20 cursor-pointer"
                                  title="Di chuyển lên trên"
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveFormField(idx, "down")}
                                  disabled={idx === formConfig.fields.length - 1}
                                  className="p-1 text-stone-600 hover:bg-stone-200 disabled:opacity-20 cursor-pointer"
                                  title="Di chuyển xuống dưới"
                                >
                                  <ArrowDown size={13} />
                                </button>
                              </div>

                              <label className="flex items-center gap-1 text-[11px] font-bold text-stone-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required || false}
                                  onChange={(e) => updateFormField(idx, { required: e.target.checked })}
                                  className="rounded border-stone-300 text-teal-600"
                                />
                                <span>Bắt buộc</span>
                              </label>

                              {formConfig.fields.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeFormField(idx)}
                                  className="text-stone-400 hover:text-rose-600 p-1"
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Tên Nhãn (Label)</label>
                              <input
                                type="text"
                                value={field.label || ""}
                                onChange={(e) => updateFormField(idx, { label: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Loại Trường (Type)</label>
                              <select
                                value={field.type}
                                onChange={(e) => updateFormField(idx, { type: e.target.value as any })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                              >
                                <option value="text">Chữ (Text)</option>
                                <option value="tel">Số Điện Thoại (Tel)</option>
                                <option value="email">Email</option>
                                <option value="select">Danh Sách Chọn (Select Dropdown)</option>
                                <option value="textarea">Đoạn Văn (Textarea)</option>
                                <option value="date">Ngày Tháng (Date)</option>
                              </select>
                            </div>
                          </div>

                          {/* Options Editor for Select Dropdown fields (USER REQUIREMENT) */}
                          {field.type === "select" && (
                            <div className="p-2 bg-teal-50/60 rounded-xl border border-teal-200">
                              <label className="block text-[10px] font-bold text-teal-800 mb-1">
                                Danh Sách Các Lựa Chọn Dropdown (Phân cách bằng dấu phẩy)
                              </label>
                              <input
                                type="text"
                                placeholder="Chi nhánh TP.HCM, Chi nhánh Hà Nội, Chi nhánh Đà Nẵng, Chi nhánh Cần Thơ..."
                                value={(field.options || []).join(", ")}
                                onChange={(e) =>
                                  updateFormField(idx, {
                                    options: e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                                className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg text-xs bg-white font-semibold text-stone-900 focus:outline-none"
                              />
                              <span className="text-[10px] text-teal-600 mt-0.5 block">
                                Ví dụ: Chi nhánh TP.HCM, Chi nhánh Hà Nội, Chi nhánh Đà Nẵng
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Gợi Ý Placeholder</label>
                              <input
                                type="text"
                                value={field.placeholder || ""}
                                onChange={(e) => updateFormField(idx, { placeholder: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Tên Biến Dữ Liệu (Key)</label>
                              <input
                                type="text"
                                value={field.name || ""}
                                onChange={(e) => updateFormField(idx, { name: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono text-stone-600"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. BANNER BUILDER CONTROLS */}
              {blockType === "BANNER" && (
                <div className="space-y-5 text-xs border-t pt-4">
                  {/* Colors & Image */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Palette size={14} className="text-[#0d9488]" /> 1. Khung &amp; Màu Sắc Banner
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <ColorInput
                        label="Màu Nền Background Banner"
                        value={bannerConfig.customColors?.bg}
                        onChange={(val) =>
                          setBannerConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), bg: val },
                          }))
                        }
                      />
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Ảnh Banner / Background (URL / Upload)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://..."
                            value={bannerConfig.imageUrl || ""}
                            onChange={(e) => setBannerConfig((prev) => ({ ...prev, imageUrl: e.target.value }))}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker("standalone-banner-img")}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg whitespace-nowrap text-xs"
                          >
                            + Viện
                          </button>
                        </div>
                      </div>
                      <ColorInput
                        label="Màu Chữ Tiêu Đề"
                        value={bannerConfig.customColors?.titleColor}
                        onChange={(val) =>
                          setBannerConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), titleColor: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Chữ Subtitle Mô Tả"
                        value={bannerConfig.customColors?.textColor}
                        onChange={(val) =>
                          setBannerConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), textColor: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Nền Nút CTA Hotline"
                        value={bannerConfig.customColors?.buttonBg}
                        onChange={(val) =>
                          setBannerConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), buttonBg: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Chữ Nút CTA Hotline"
                        value={bannerConfig.customColors?.buttonText}
                        onChange={(val) =>
                          setBannerConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), buttonText: val },
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">2. Nội Dung Text &amp; Nút Bấm CTA Banner</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Nhãn Badge Nổi Bật</label>
                        <input
                          type="text"
                          placeholder="ƯU ĐÃI THÁNG NÀY"
                          value={bannerConfig.badge || ""}
                          onChange={(e) => setBannerConfig((prev) => ({ ...prev, badge: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-teal-700 uppercase"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Mã Voucher Ưu Đãi</label>
                        <input
                          type="text"
                          placeholder="LUOI20OFF"
                          value={bannerConfig.couponCode || ""}
                          onChange={(e) => setBannerConfig((prev) => ({ ...prev, couponCode: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono font-bold text-rose-600 uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Tiêu Đề Banner Headline</label>
                      <input
                        type="text"
                        placeholder="Giảm Ngay 20% Cho Đơn Hàng Đầu Tiên"
                        value={bannerConfig.headline || ""}
                        onChange={(e) => setBannerConfig((prev) => ({ ...prev, headline: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Mô Tả Subtitle Banner</label>
                      <input
                        type="text"
                        placeholder="Nhập mã LUOI20OFF khi liên hệ..."
                        value={bannerConfig.subtitle || ""}
                        onChange={(e) => setBannerConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Text Nút Bấm CTA Banner</label>
                        <input
                          type="text"
                          placeholder="Gọi 0901.234.567"
                          value={bannerConfig.ctaText || ""}
                          onChange={(e) => setBannerConfig((prev) => ({ ...prev, ctaText: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-amber-600"
                        />
                      </div>
                      <CtaLinkInput
                        label="Hành Động Khi Click Nút Banner CTA"
                        value={bannerConfig.ctaUrl || ""}
                        onChange={(val) => setBannerConfig((prev) => ({ ...prev, ctaUrl: val }))}
                        formBlocks={formBlocks}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. BUTTON BUILDER CONTROLS */}
              {blockType === "BUTTON" && (
                <div className="space-y-5 text-xs border-t pt-4">
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Palette size={14} className="text-[#0d9488]" /> 1. Màu Sắc &amp; Căn Lề Nút CTA Standalone
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <ColorInput
                        label="Màu Nền Nút Bấm"
                        value={buttonConfig.customColors?.buttonBg}
                        onChange={(val) =>
                          setButtonConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), buttonBg: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Chữ Nút Bấm"
                        value={buttonConfig.customColors?.buttonText}
                        onChange={(val) =>
                          setButtonConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), buttonText: val },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Căn Lề Nút Bấm CTA</label>
                      <select
                        value={buttonConfig.align || "center"}
                        onChange={(e) => setButtonConfig((prev) => ({ ...prev, align: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg font-bold text-xs"
                      >
                        <option value="center">Căn Giữa (Center)</option>
                        <option value="left">Căn Trái (Left)</option>
                        <option value="full">Trải Dài Toàn Bộ (Full Width)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">2. Nội Dung Text &amp; Hành Động Khi Click</h4>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Text Nút Bấm CTA Standalone</label>
                      <input
                        type="text"
                        placeholder="LIÊN HỆ ĐẶT LỊCH NGAY →"
                        value={buttonConfig.text || ""}
                        onChange={(e) => setButtonConfig((prev) => ({ ...prev, text: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold uppercase text-teal-700"
                      />
                    </div>
                    <CtaLinkInput
                      label="Hành Động Khi Click Nút Bấm CTA Standalone"
                      value={buttonConfig.url || ""}
                      onChange={(val) => setButtonConfig((prev) => ({ ...prev, url: val }))}
                      formBlocks={formBlocks}
                    />
                  </div>
                </div>
              )}

              {/* 5. SLIDER & VOUCHER BUILDER CONTROLS */}
              {(blockType === "SLIDER" || blockType === "VOUCHER") && (
                <div className="space-y-5 text-xs border-t pt-4">
                  {/* Khung Background & Text Header */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-[#0d9488]" /> 1. Khung &amp; Màu Sắc Khối Slider Carousel
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <ColorInput
                        label="Màu Nền Background Khung"
                        value={sliderConfig.customColors?.bg}
                        onChange={(val) =>
                          setSliderConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), bg: val },
                          }))
                        }
                      />
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Ảnh Nền Background (URL / Upload)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://..."
                            value={sliderConfig.bgImageUrl || ""}
                            onChange={(e) => setSliderConfig((prev) => ({ ...prev, bgImageUrl: e.target.value }))}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker("slider-bg-img")}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg whitespace-nowrap text-xs"
                          >
                            + Viện
                          </button>
                        </div>
                      </div>
                      <ColorInput
                        label="Màu Chữ Tiêu Đề Khối"
                        value={sliderConfig.customColors?.titleColor}
                        onChange={(val) =>
                          setSliderConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), titleColor: val },
                          }))
                        }
                      />
                      <ColorInput
                        label="Màu Chữ Subtitle Mô Tả"
                        value={sliderConfig.customColors?.textColor}
                        onChange={(val) =>
                          setSliderConfig((prev) => ({
                            ...prev,
                            customColors: { ...(prev.customColors || {}), textColor: val },
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Header Title & Layout */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">2. Tiêu Đề Khối &amp; Layout</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Tiêu Đề Khối Slider</label>
                        <input
                          type="text"
                          placeholder="ĐỘI NGHŨ CHUYÊN GIA BÁC SĨ..."
                          value={sliderConfig.title || ""}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Kiểu Layout Slider</label>
                        <select
                          value={sliderConfig.layout || "CARD_GRID"}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, layout: e.target.value as any }))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                        >
                          <option value="CARD_GRID">Lưới Card Ngang (Multi-Card)</option>
                          <option value="COVERFLOW">3D Carousel Coverflow</option>
                          <option value="VOUCHER_SWIPER">🎟️ Swiper 3D Voucher Coverflow (Vé Ưu Đãi)</option>
                          <option value="HERO_BANNER">Hero Banner Slider</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Mô Tả Subtitle Khối</label>
                      <input
                        type="text"
                        placeholder="Hệ thống trang thiết bị hiện đại..."
                        value={sliderConfig.subtitle || ""}
                        onChange={(e) => setSliderConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* 3. Display Elements Visibility Toggles */}
                  <div className="p-3.5 bg-[#0d9488]/5 rounded-2xl border border-[#0d9488]/20 space-y-2.5">
                    <h4 className="font-bold text-[#0d9488] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles size={14} /> 3. Tùy Chọn Ẩn / Hiện Các Phần Tử Trên Card (Hiển Thị Theo Yêu Cầu)
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Bật/tắt các thành phần trên thẻ (bỏ chọn tất cả chữ nếu bạn chỉ muốn hiển thị mỗi Hình Ảnh banner slider):
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-semibold text-stone-800">
                      <label className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-teal-50/50">
                        <input
                          type="checkbox"
                          checked={sliderConfig.showImage ?? true}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, showImage: e.target.checked }))}
                          className="rounded text-[#0d9488]"
                        />
                        <span>🖼️ Hiển thị Ảnh</span>
                      </label>

                      <label className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-teal-50/50">
                        <input
                          type="checkbox"
                          checked={sliderConfig.showTitle ?? true}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, showTitle: e.target.checked }))}
                          className="rounded text-[#0d9488]"
                        />
                        <span>🏷️ Tiêu đề</span>
                      </label>

                      <label className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-teal-50/50">
                        <input
                          type="checkbox"
                          checked={sliderConfig.showSubtitle ?? true}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, showSubtitle: e.target.checked }))}
                          className="rounded text-[#0d9488]"
                        />
                        <span>👤 Subtitle</span>
                      </label>

                      <label className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-teal-50/50">
                        <input
                          type="checkbox"
                          checked={sliderConfig.showDescription ?? true}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, showDescription: e.target.checked }))}
                          className="rounded text-[#0d9488]"
                        />
                        <span>📝 Mô tả ngắn</span>
                      </label>

                      <label className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-teal-50/50">
                        <input
                          type="checkbox"
                          checked={sliderConfig.showBadge ?? true}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, showBadge: e.target.checked }))}
                          className="rounded text-[#0d9488]"
                        />
                        <span>💰 Giá / Badge</span>
                      </label>

                      <label className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-teal-50/50">
                        <input
                          type="checkbox"
                          checked={sliderConfig.showVoucherCode ?? true}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, showVoucherCode: e.target.checked }))}
                          className="rounded text-[#0d9488]"
                        />
                        <span>🎟️ Mã Voucher</span>
                      </label>

                      <label className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-teal-50/50 col-span-2 sm:col-span-1">
                        <input
                          type="checkbox"
                          checked={sliderConfig.showSlideCta ?? true}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, showSlideCta: e.target.checked }))}
                          className="rounded text-[#0d9488]"
                        />
                        <span>🔘 Nút CTA Slide</span>
                      </label>
                    </div>
                  </div>

                  {/* 4. Bottom CTA Section */}
                  <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-teal-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Sparkles size={14} className="text-teal-600" /> 3. Nút CTA Tổng Ở Dưới Slider
                      </h4>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sliderConfig.showBottomCta ?? true}
                          onChange={(e) => setSliderConfig((prev) => ({ ...prev, showBottomCta: e.target.checked }))}
                          className="rounded border-stone-300 text-teal-600"
                        />
                        <span>Hiển thị Nút CTA Tổng</span>
                      </label>
                    </div>

                    {sliderConfig.showBottomCta !== false && (
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Text Nút CTA Tổng</label>
                          <input
                            type="text"
                            placeholder="🎁 ĐĂNG KÝ KHÁM & TƯ VẤN MIỄN PHÍ"
                            value={sliderConfig.bottomCtaText || ""}
                            onChange={(e) => setSliderConfig((prev) => ({ ...prev, bottomCtaText: e.target.value }))}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-teal-700 uppercase"
                          />
                        </div>
                        <CtaLinkInput
                          label="Hành Động Khi Click Nút CTA Tổng Slider"
                          value={sliderConfig.bottomCtaUrl || ""}
                          onChange={(val) => setSliderConfig((prev) => ({ ...prev, bottomCtaUrl: val }))}
                          formBlocks={formBlocks}
                        />
                      </div>
                    )}
                  </div>

                  {/* 4. SLIDES MANAGER */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-[#0d9488]" /> 4. Quản Lý Các Slide Card ({sliderConfig.slides.length} slide)
                      </h4>
                      <button
                        type="button"
                        onClick={addSlideItem}
                        className="px-3 py-1 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs"
                      >
                        + Thêm Slide Mới
                      </button>
                    </div>

                    <div className="space-y-4">
                      {sliderConfig.slides.map((slide, idx) => (
                        <div key={slide.id || idx} className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3 relative">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-mono flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span>Slide #{idx + 1}: {slide.title || "Chưa đặt tên"}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              {sliderConfig.slides.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSliderConfig((prev) => ({
                                      ...prev,
                                      slides: prev.slides.filter((_, i) => i !== idx),
                                    }))
                                  }
                                  className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                                  title="Xóa slide này"
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Tiêu Đề Slide (Tên / Dịch vụ)</label>
                              <input
                                type="text"
                                placeholder="VD: Phạm Nguyễn hoặc Răng Sứ Katana"
                                value={slide.title || ""}
                                onChange={(e) => updateSlideItem(idx, { title: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Chức Danh / Subtitle</label>
                              <input
                                type="text"
                                placeholder="VD: Bác sĩ Chuyên khoa I"
                                value={slide.subtitle || ""}
                                onChange={(e) => updateSlideItem(idx, { subtitle: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs text-teal-700 font-medium"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Giá Tiền</label>
                              <input
                                type="text"
                                placeholder="VD: 2.800.000Đ"
                                value={slide.price || ""}
                                onChange={(e) => updateSlideItem(idx, { price: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono font-bold text-rose-600"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Nhãn Badge</label>
                              <input
                                type="text"
                                placeholder="VD: BÁN CHẠY NHẤT"
                                value={slide.badge || ""}
                                onChange={(e) => updateSlideItem(idx, { badge: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-amber-700 uppercase"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Mã Voucher</label>
                              <input
                                type="text"
                                placeholder="VD: VOUCHER-2026"
                                value={slide.voucherCode || ""}
                                onChange={(e) => updateSlideItem(idx, { voucherCode: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono font-bold text-teal-700 uppercase"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Mô Tả Ngắn Slide</label>
                            <textarea
                              rows={2}
                              placeholder="Mô tả chi tiết kinh nghiệm, dịch vụ hoặc quà tặng..."
                              value={slide.description || ""}
                              onChange={(e) => updateSlideItem(idx, { description: e.target.value })}
                              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Ảnh Slide (URL / Upload)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="https://..."
                                value={slide.imageUrl || ""}
                                onChange={(e) => updateSlideItem(idx, { imageUrl: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => openMediaPicker("slide-img", idx)}
                                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg whitespace-nowrap text-xs"
                              >
                                + Viện
                              </button>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-stone-100 flex items-center justify-between">
                            <label className="flex items-center gap-1 text-[11px] font-bold text-stone-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slide.showCta ?? true}
                                onChange={(e) => updateSlideItem(idx, { showCta: e.target.checked })}
                                className="rounded border-stone-300 text-teal-600"
                              />
                              <span>Hiển thị Nút CTA Slide này</span>
                            </label>
                          </div>

                          {slide.showCta !== false && (
                            <div className="space-y-2 pt-1">
                              <div>
                                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Text Nút CTA Slide</label>
                                <input
                                  type="text"
                                  placeholder="Xem chi tiết →"
                                  value={slide.ctaText || ""}
                                  onChange={(e) => updateSlideItem(idx, { ctaText: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-teal-700"
                                />
                              </div>
                              <CtaLinkInput
                                label="Hành Động Khi Click Nút Slide Này"
                                value={slide.ctaUrl || ""}
                                onChange={(val) => updateSlideItem(idx, { ctaUrl: val })}
                                formBlocks={formBlocks}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t flex items-center justify-between gap-3 font-mono">
                {msg && <span className="text-xs font-bold text-emerald-700">{msg}</span>}
                <button
                  onClick={handleSaveBlock}
                  disabled={saving}
                  className="w-full py-3 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>{saving ? "Đang lưu..." : "LƯU BLOCK VÀO DATABASE"}</span>
                </button>
              </div>
            </div>

            {/* Right Live Real-Time Preview Panel (7 Cols) */}
            <div className="md:col-span-7 space-y-4 font-mono">
              <div className="bg-[#042d2a] text-white p-4 rounded-2xl border border-[#084540] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#00c9b7] block">Mã Shortcode Dán Vào Bài Viết:</span>
                  <code className="text-sm font-mono font-bold text-white">{generatedShortcodeTag}</code>
                </div>
                <button
                  onClick={() => handleCopy(generatedShortcodeTag)}
                  className="px-4 py-2 bg-[#00c9b7] hover:bg-[#00b0a1] text-[#023835] text-xs font-mono font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  {copiedCode === generatedShortcodeTag ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCode === generatedShortcodeTag ? "Đã copy mã" : "Sao chép mã"}
                </button>
              </div>

              {/* Live Render Container */}
              <div className="bg-stone-100 p-6 rounded-3xl border border-stone-200/80 min-h-[420px] shadow-xs space-y-3">
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} className="text-[#0d9488]" /> Giao diện thực tế cập nhật theo thời gian thực (Live Preview):
                </span>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden">
                  {blockType === "LUCKY_SPIN" && <LuckySpinBlock config={luckySpinConfig} />}
                  {blockType === "CUSTOM_CANVAS" && <CustomCanvasBlock config={canvasConfig} />}
                  {blockType === "PRICING" && <DynamicPricingBlock config={pricingConfig} />}
                  {blockType === "FORM" && <DynamicFormBlock config={formConfig} />}
                  {blockType === "BANNER" && <StandaloneBannerBlock config={bannerConfig} />}
                  {blockType === "BUTTON" && <StandaloneButtonBlock config={buttonConfig} />}
                  {blockType === "SLIDER" && <PromotionalSliderBlock config={sliderConfig} />}
                  {blockType === "VOUCHER" && <PromotionalSliderBlock config={{ ...sliderConfig, layout: "VOUCHER_SWIPER" }} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 2: SAVED BLOCKS LIBRARY */}
      {/* --------------------------------------------------------- */}
      {activeTab === "library" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-stone-900">Danh Sách Visual Block Đã Lưu ({savedBlocks.length})</h2>
            <button
              onClick={() => {
                setEditingId(null);
                setActiveTab("builder");
              }}
              className="px-4 py-2 bg-[#0d9488] text-white text-xs font-bold rounded-xl hover:bg-[#0f766e] flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={15} /> Tạo Block Mới
            </button>
          </div>

          {savedBlocks.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center space-y-3 text-stone-500">
              <p>Chưa có Block tùy biến nào được lưu trong Database.</p>
              <button onClick={() => setActiveTab("builder")} className="px-4 py-2 bg-[#0d9488] text-white text-xs font-bold rounded-xl">
                Tạo Block Đầu Tiên Ngay →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedBlocks.map((block) => {
                const tag = `[block key="${block.key}"]`;
                const isCopied = copiedCode === tag;

                return (
                  <div key={block.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0d9488] text-[10px] font-mono font-bold uppercase">
                          {block.type}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(block.updatedAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-stone-900">{block.name}</h3>
                      <code className="block p-2 bg-stone-900 text-teal-300 font-mono text-xs font-bold rounded-xl">
                        {tag}
                      </code>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLoadBlockForEdit(block)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteSavedBlock(block.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleCopy(tag)}
                        className="px-4 py-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        {isCopied ? "Đã copy" : "Sao chép mã"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
