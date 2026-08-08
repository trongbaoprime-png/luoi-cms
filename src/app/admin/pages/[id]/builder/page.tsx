"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Eye,
  ArrowLeft,
  Layout,
  Grid,
  ShoppingBag,
  Tag,
  HelpCircle,
  CheckCircle2,
  Edit3,
  Type,
  MousePointer,
  Play,
  Clock,
  FormInput,
  Laptop,
  Smartphone,
  Gift,
  GripVertical,
  Code,
  QrCode,
  Sliders,
  Palette,
  CheckSquare,
  ListPlus,
  MoveRight,
} from "lucide-react";

export interface FormField {
  id: string;
  label: string;
  name: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface UXBlock {
  id: string;
  type:
    | "hero"
    | "text"
    | "button"
    | "timer"
    | "video"
    | "features"
    | "products"
    | "deals"
    | "faq"
    | "luckywheel"
    | "form"
    | "html"
    | "compare"
    | "vietqr";
  title?: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  ctaUrl?: string;
  bgColor?: string;
  textColor?: string;
  primaryColor?: string;
  formFields?: FormField[];
  htmlContent?: string;
  items?: Array<{ title?: string; desc?: string; q?: string; a?: string }>;
}

export default function LadiPageBuilderStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [blocks, setBlocks] = useState<UXBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Studio UI State
  const [activeTab, setActiveTab] = useState<"elements" | "forms" | "sections" | "templates">("forms");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [draggedCanvasIndex, setDraggedCanvasIndex] = useState<number | null>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);

  useEffect(() => {
    fetch(`/api/pages/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPageTitle(data.data.title);
          setSlug(data.data.slug);
          try {
            if (data.data.blocks) {
              setBlocks(JSON.parse(data.data.blocks));
            } else {
              loadTemplate("product");
            }
          } catch {
            setBlocks([]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const loadTemplate = (templateType: "product" | "flashsale" | "service") => {
    if (templateType === "product") {
      setBlocks([
        {
          id: "1",
          type: "hero",
          title: "Robot Hút Bụi & Lau Nhà Thông Minh Lười Dọn Nhà",
          subtitle: "Tự động giặt giẻ, sấy khô, lực hút 8000Pa. Không tốn 1 phút động tay lau dọn!",
          badge: "Bán Chạy Nhất 2026",
          ctaText: "Săn Deal Giảm 40%",
          ctaUrl: "#deals",
          bgColor: "#0f766e",
          textColor: "#ffffff",
          primaryColor: "#f59e0b",
        },
        {
          id: "2",
          type: "form",
          title: "Form Đăng Ký Tư Vấn & Nhận Khảo Sát",
          subtitle: "Để lại thông tin để nhận báo giá ưu đãi tốt nhất hôm nay.",
          badge: "Đăng Ký Tư Vấn",
          ctaText: "GỬI ĐĂNG KÝ NGAY",
          bgColor: "#ffffff",
          textColor: "#0f172a",
          primaryColor: "#0d9488",
          formFields: [
            { id: "f1", label: "Họ và tên", name: "name", type: "text", placeholder: "Nguyễn Văn A", required: true },
            { id: "f2", label: "Số điện thoại Zalo", name: "phone", type: "tel", placeholder: "0912345678", required: true },
            { id: "f3", label: "Email liên hệ", name: "email", type: "email", placeholder: "email@domain.com", required: false },
            { id: "f4", label: "Địa chỉ giao hàng / nhận khảo sát", name: "address", type: "textarea", placeholder: "Số nhà, tên đường, phường/xã...", required: true },
          ],
        },
        {
          id: "3",
          type: "luckywheel",
          title: "Vòng Quay May Mắn - Săn Mã Giảm Giá",
          subtitle: "Quay 100% nhận Voucher 50k, Freeship 0đ và mã giảm sâu hôm nay!",
          primaryColor: "#f59e0b",
        },
        {
          id: "4",
          type: "vietqr",
          title: "Đặt Hàng Nhanh & Thanh Toán QR VietQR Tự Động",
          subtitle: "Nhận hàng tại nhà, quét mã QR VietQR nhận ngay quà tặng 200k",
          primaryColor: "#0d9488",
        },
        {
          id: "5",
          type: "timer",
          title: "Flash Sale Độc Quyền Shopee Mall",
          subtitle: "Ưu Đãi Kết Thúc Sau:",
          primaryColor: "#e11d48",
        },
      ]);
    } else {
      setBlocks([
        {
          id: "1",
          type: "hero",
          title: "Dịch Vụ Vệ Sinh Căn Hộ Trọn Gói",
          subtitle: "Đội ngũ chuyên nghiệp, trang thiết bị lau dọn thông minh.",
          bgColor: "#1e293b",
          textColor: "#ffffff",
          primaryColor: "#3b82f6",
        },
        {
          id: "2",
          type: "form",
          title: "Đặt Lịch Khảo Sát Tận Nơi",
          subtitle: "Điền địa chỉ căn hộ để xếp lịch khảo sát báo giá.",
          bgColor: "#ffffff",
          textColor: "#0f172a",
          primaryColor: "#2563eb",
          formFields: [
            { id: "f1", label: "Họ và tên", name: "name", type: "text", placeholder: "Nhập họ tên...", required: true },
            { id: "f2", label: "Số điện thoại", name: "phone", type: "tel", placeholder: "Nhập số điện thoại...", required: true },
            { id: "f3", label: "Địa chỉ căn hộ", name: "address", type: "text", placeholder: "Nhập địa chỉ...", required: true },
          ],
        },
      ]);
    }
  };

  const addBlockFromDrag = (type: string) => {
    const defaultFields: FormField[] = [
      { id: Date.now() + "1", label: "Họ và tên", name: "name", type: "text", placeholder: "Nguyễn Văn A", required: true },
      { id: Date.now() + "2", label: "Số điện thoại", name: "phone", type: "tel", placeholder: "0912345678", required: true },
      { id: Date.now() + "3", label: "Email", name: "email", type: "email", placeholder: "email@domain.com", required: false },
      { id: Date.now() + "4", label: "Địa chỉ giao hàng", name: "address", type: "textarea", placeholder: "Nhập địa chỉ nhận hàng...", required: true },
    ];

    const newBlock: UXBlock = {
      id: Date.now().toString(),
      type: type as UXBlock["type"],
      title:
        type === "form"
          ? "Form Đăng Ký Tư Vấn & Đặt Hàng"
          : type === "vietqr"
          ? "Thanh Toán VietQR Tự Động"
          : type === "compare"
          ? "Ảnh So Sánh Trước & Sau"
          : type === "hero"
          ? "Hero Banner Sản Phẩm Nổi Bật"
          : type === "luckywheel"
          ? "Vòng Quay May Mắn Trúng Thưởng"
          : type === "text"
          ? "Đoạn Văn Bản Tiêu Đề Mới"
          : type === "button"
          ? "Nút Bấm Kích Hoạt CTA"
          : type === "timer"
          ? "Đồng Hồ Đếm Ngược Flash Sale"
          : type === "video"
          ? "Video Giới Thiệu Trải Nghiệm"
          : type === "features"
          ? "Lưới Tính Năng & Lợi Ích"
          : type === "products"
          ? "Sản Phẩm Affiliate Khuyên Dùng"
          : type === "deals"
          ? "Mã Giảm Giá Voucher Hot"
          : "Câu Hỏi Thường Gặp (FAQ)",
      subtitle: "Mô tả ngắn tùy chỉnh thuộc tính phần tử",
      bgColor: type === "hero" ? "#0f766e" : "#ffffff",
      textColor: type === "hero" ? "#ffffff" : "#0f172a",
      primaryColor: "#0d9488",
      formFields: type === "form" ? defaultFields : undefined,
      htmlContent: `<div style="padding:16px;background:#f1f5f9;text-align:center;border-radius:12px;font-family:sans-serif;">Khối Custom HTML tùy biến</div>`,
    };

    setBlocks((prev) => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  // STRICT Drag & Drop Sidebar Handlers (NO CLICK SELECTION ALLOWED)
  const handleSidebarDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("text/plain", type);
    e.dataTransfer.effectAllowed = "copy";
    setDraggedType(type);
  };

  const handleSidebarDragEnd = () => {
    setDraggedType(null);
    setIsOverCanvas(false);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isOverCanvas) setIsOverCanvas(true);
  };

  const handleCanvasDragLeave = () => {
    setIsOverCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverCanvas(false);
    const type = e.dataTransfer.getData("text/plain") || draggedType;
    if (type) {
      addBlockFromDrag(type);
      setDraggedType(null);
    }
  };

  // Drag to reorder blocks within Canvas
  const handleCanvasBlockDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/canvas-index", index.toString());
    setDraggedCanvasIndex(index);
  };

  const handleCanvasBlockDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData("text/canvas-index");
    const sourceIndex = sourceIndexStr ? parseInt(sourceIndexStr, 10) : draggedCanvasIndex;

    if (sourceIndex !== null && sourceIndex !== targetIndex) {
      const updated = [...blocks];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      setBlocks(updated);
    }
    setDraggedCanvasIndex(null);
  };

  // Dynamic Form Field Editing Handlers
  const addFormField = (blockId: string) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId) {
          const currentFields = b.formFields || [];
          const newField: FormField = {
            id: Date.now().toString(),
            label: "Trường dữ liệu mới",
            name: `field_${currentFields.length + 1}`,
            type: "text",
            placeholder: "Nhập thông tin...",
            required: false,
          };
          return { ...b, formFields: [...currentFields, newField] };
        }
        return b;
      })
    );
  };

  const removeFormField = (blockId: string, fieldId: string) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId && b.formFields) {
          return {
            ...b,
            formFields: b.formFields.filter((f) => f.id !== fieldId),
          };
        }
        return b;
      })
    );
  };

  const updateFormField = (blockId: string, fieldId: string, updates: Partial<FormField>) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId && b.formFields) {
          return {
            ...b,
            formFields: b.formFields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
          };
        }
        return b;
      })
    );
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const updateActiveBlock = (fields: Partial<UXBlock>) => {
    if (!activeBlockId) return;
    setBlocks(
      blocks.map((b) => (b.id === activeBlockId ? { ...b, ...fields } : b))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: JSON.stringify(blocks),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✓ Đã xuất bản trang thành công!");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto min-h-screen">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm sticky top-2 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Layout className="w-5 h-5 text-[#0d9488]" />
              LadiPage &amp; Pancake Drag &amp; Drop Studio: {pageTitle || "Đang nạp..."}
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              Trang công khai: /{slug}
            </p>
          </div>
        </div>

        {/* Device Switcher & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setDeviceMode("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                deviceMode === "desktop"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Laptop size={14} />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                deviceMode === "mobile"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Smartphone size={14} />
              <span>Mobile (375px)</span>
            </button>
          </div>

          {msg && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 size={14} /> {msg}
            </span>
          )}

          <Link
            href={`/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
          >
            <Eye size={14} />
            <span>Xem trang live</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0d9488] text-white font-bold text-xs hover:bg-[#0f766e] transition-colors shadow-sm"
          >
            <Save size={14} />
            <span>{saving ? "Đang lưu..." : "Lưu & Xuất Bản"}</span>
          </button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Drawer: Element Category Sidebar & Detailed Inspector */}
        <div className="md:col-span-5 grid grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm h-fit">
          {/* Navigation Category Tab Icons Column */}
          <div className="col-span-3 border-r border-stone-200 pr-2 space-y-2 text-xs">
            <button
              onClick={() => setActiveTab("forms")}
              className={`w-full p-2.5 rounded-xl font-bold flex flex-col items-center gap-1 text-center transition-colors ${
                activeTab === "forms"
                  ? "bg-teal-50 text-[#0d9488]"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <FormInput size={18} />
              <span>Form</span>
            </button>
            <button
              onClick={() => setActiveTab("elements")}
              className={`w-full p-2.5 rounded-xl font-bold flex flex-col items-center gap-1 text-center transition-colors ${
                activeTab === "elements"
                  ? "bg-teal-50 text-[#0d9488]"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Type size={18} />
              <span>Phần tử</span>
            </button>
            <button
              onClick={() => setActiveTab("sections")}
              className={`w-full p-2.5 rounded-xl font-bold flex flex-col items-center gap-1 text-center transition-colors ${
                activeTab === "sections"
                  ? "bg-teal-50 text-[#0d9488]"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Grid size={18} />
              <span>Section</span>
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`w-full p-2.5 rounded-xl font-bold flex flex-col items-center gap-1 text-center transition-colors ${
                activeTab === "templates"
                  ? "bg-teal-50 text-[#0d9488]"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Sparkles size={18} />
              <span>Kho Mẫu</span>
            </button>
          </div>

          {/* Sub-Element Items Picker List (STRICT DRAG & DROP ONLY - NO CLICK TO ADD) */}
          <div className="col-span-9 space-y-4">
            <div className="text-[11px] font-bold text-teal-900 bg-teal-50 p-2.5 rounded-xl border border-teal-200 text-center flex items-center justify-center gap-2">
              <GripVertical size={16} className="text-[#0d9488] animate-bounce" />
              <span>KÉO THẢ PHẦN TỬ SANG KHUNG BÊN PHẢI</span>
            </div>

            {activeTab === "forms" && (
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Form Đăng Ký (Bắt buộc Kéo &amp; Thả)
                </h3>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "form")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-3 bg-teal-50 hover:bg-teal-100 text-[#0d9488] rounded-xl border border-teal-200 cursor-grab active:cursor-grabbing font-bold flex items-center justify-between shadow-2xs select-none hover:scale-[1.01] transition-transform"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} className="text-[#0d9488]" /> 📋 Form Đăng Ký Tùy Biến
                  </span>
                  <MoveRight size={14} className="text-[#0d9488]" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "vietqr")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-3 bg-stone-900 text-amber-300 rounded-xl border border-stone-800 cursor-grab active:cursor-grabbing font-bold flex items-center justify-between shadow-2xs select-none hover:scale-[1.01] transition-transform"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} className="text-amber-400" /> 💳 Form Thanh Toán VietQR
                  </span>
                  <MoveRight size={14} className="text-amber-400" />
                </div>
              </div>
            )}

            {activeTab === "elements" && (
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Phần Tử Kéo Thả (Bắt buộc Kéo &amp; Thả)
                </h3>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "compare")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-2.5 bg-[#0d9488] text-white font-bold rounded-xl shadow-2xs cursor-grab active:cursor-grabbing flex items-center justify-between select-none hover:scale-[1.01] transition-transform"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} /> <Sliders size={14} /> Ảnh So Sánh Trước/Sau
                  </span>
                  <MoveRight size={14} />
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "luckywheel")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950 font-bold rounded-xl shadow-2xs cursor-grab active:cursor-grabbing flex items-center justify-between select-none hover:scale-[1.01] transition-transform"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} /> 🎰 Vòng Quay May Mắn
                  </span>
                  <MoveRight size={14} />
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "text")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-2 bg-stone-50 hover:bg-teal-50 hover:text-[#0d9488] rounded-lg border border-stone-200 cursor-grab active:cursor-grabbing flex items-center justify-between font-medium select-none"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} className="text-stone-400" /> Tiêu Đề / Đoạn Văn
                  </span>
                  <MoveRight size={14} className="text-stone-400" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "button")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-2 bg-stone-50 hover:bg-teal-50 hover:text-[#0d9488] rounded-lg border border-stone-200 cursor-grab active:cursor-grabbing flex items-center justify-between font-medium select-none"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} className="text-stone-400" /> Nút Bấm CTA
                  </span>
                  <MoveRight size={14} className="text-stone-400" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "timer")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-2 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 cursor-grab active:cursor-grabbing flex items-center justify-between font-bold select-none"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} className="text-amber-600" /> Đếm Ngược Flash Sale
                  </span>
                  <MoveRight size={14} className="text-amber-600" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "html")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-2 bg-stone-50 hover:bg-teal-50 hover:text-[#0d9488] rounded-lg border border-stone-200 cursor-grab active:cursor-grabbing flex items-center justify-between font-medium select-none"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} className="text-stone-400" /> <Code size={14} /> Custom HTML Code
                  </span>
                  <MoveRight size={14} className="text-stone-400" />
                </div>
              </div>
            )}

            {activeTab === "sections" && (
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Khối Section (Bắt buộc Kéo &amp; Thả)
                </h3>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "hero")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-2 bg-stone-50 hover:bg-teal-50 hover:text-[#0d9488] rounded-lg border border-stone-200 cursor-grab active:cursor-grabbing flex items-center justify-between font-medium select-none"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} className="text-stone-400" /> Hero Banner Section
                  </span>
                  <MoveRight size={14} className="text-stone-400" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "features")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-2 bg-stone-50 hover:bg-teal-50 hover:text-[#0d9488] rounded-lg border border-stone-200 cursor-grab active:cursor-grabbing flex items-center justify-between font-medium select-none"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} className="text-stone-400" /> Lưới Tính Năng
                  </span>
                  <MoveRight size={14} className="text-stone-400" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "products")}
                  onDragEnd={handleSidebarDragEnd}
                  className="p-2 bg-stone-50 hover:bg-teal-50 hover:text-[#0d9488] rounded-lg border border-stone-200 cursor-grab active:cursor-grabbing flex items-center justify-between font-medium select-none"
                >
                  <span className="flex items-center gap-2">
                    <GripVertical size={16} className="text-stone-400" /> Sản Phẩm Affiliate
                  </span>
                  <MoveRight size={14} className="text-stone-400" />
                </div>
              </div>
            )}

            {/* Comprehensive Property & Form Field Inspector */}
            {activeBlock && (
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0d9488] uppercase flex items-center gap-1">
                    <Palette size={14} /> Thuộc Tính Khối: {activeBlock.type}
                  </h4>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Colors Inspector */}
                  <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <div>
                      <label className="block text-[11px] text-stone-600 font-semibold mb-1">Màu Nền (Bg)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeBlock.bgColor || "#ffffff"}
                          onChange={(e) => updateActiveBlock({ bgColor: e.target.value })}
                          className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                        />
                        <span className="font-mono text-[10px] text-stone-600">{activeBlock.bgColor || "#ffffff"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 font-semibold mb-1">Màu Nút Bấm/Accent</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeBlock.primaryColor || "#0d9488"}
                          onChange={(e) => updateActiveBlock({ primaryColor: e.target.value })}
                          className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                        />
                        <span className="font-mono text-[10px] text-stone-600">{activeBlock.primaryColor || "#0d9488"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Tiêu đề khối</label>
                    <input
                      type="text"
                      value={activeBlock.title || ""}
                      onChange={(e) => updateActiveBlock({ title: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Mô tả / Phụ đề</label>
                    <textarea
                      value={activeBlock.subtitle || ""}
                      onChange={(e) => updateActiveBlock({ subtitle: e.target.value })}
                      rows={2}
                      className="w-full px-2.5 py-1.5 border rounded-lg"
                    />
                  </div>

                  {/* Form Field Builder UI */}
                  {activeBlock.type === "form" && (
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800 text-[11px] uppercase flex items-center gap-1">
                          <ListPlus size={14} className="text-[#0d9488]" /> Trường dữ liệu Form ({activeBlock.formFields?.length || 0})
                        </span>
                        <button
                          onClick={() => addFormField(activeBlock.id)}
                          className="px-2 py-1 bg-teal-50 text-[#0d9488] font-bold text-[11px] rounded-md hover:bg-teal-100 flex items-center gap-1"
                        >
                          <Plus size={12} /> Thêm trường
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {(activeBlock.formFields || []).map((field, fIdx) => (
                          <div key={field.id} className="p-2 bg-stone-50 border rounded-lg space-y-1.5 relative">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-stone-700 text-[11px]">Trường #{fIdx + 1}</span>
                              <button
                                onClick={() => removeFormField(activeBlock.id, field.id)}
                                className="text-rose-500 hover:text-rose-700 p-0.5"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="text"
                                placeholder="Nhãn (Label)"
                                value={field.label}
                                onChange={(e) => updateFormField(activeBlock.id, field.id, { label: e.target.value })}
                                className="px-2 py-1 border rounded text-[11px]"
                              />
                              <select
                                value={field.type}
                                onChange={(e) => updateFormField(activeBlock.id, field.id, { type: e.target.value as any })}
                                className="px-2 py-1 border rounded text-[11px]"
                              >
                                <option value="text">Văn bản (Text)</option>
                                <option value="tel">Số điện thoại (Tel)</option>
                                <option value="email">Email</option>
                                <option value="textarea">Văn bản nhiều dòng (Textarea)</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <input
                                type="text"
                                placeholder="Placeholder..."
                                value={field.placeholder || ""}
                                onChange={(e) => updateFormField(activeBlock.id, field.id, { placeholder: e.target.value })}
                                className="px-2 py-0.5 border rounded text-[10px] w-32"
                              />
                              <label className="flex items-center gap-1 text-[10px] text-stone-600 font-semibold cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required || false}
                                  onChange={(e) => updateFormField(activeBlock.id, field.id, { required: e.target.checked })}
                                />
                                Bắt buộc
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Canvas: Dropzone Container for Strict Drag & Drop */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            className={`transition-all duration-300 w-full min-h-[550px] ${
              deviceMode === "mobile"
                ? "max-w-[375px] border-8 border-stone-800 rounded-[40px] shadow-2xl p-4 bg-white"
                : "max-w-full bg-white p-6 rounded-2xl border-2 shadow-sm"
            } ${
              isOverCanvas
                ? "border-[#0d9488] bg-teal-50/40 ring-4 ring-teal-100 border-solid"
                : "border-dashed border-stone-300"
            }`}
          >
            <div className="text-xs font-mono font-bold text-stone-400 mb-4 pb-2 border-b border-stone-100 flex items-center justify-between">
              <span>CANVAS DROPZONE ({blocks.length} phần tử)</span>
              <span className={isOverCanvas ? "text-teal-700 font-bold animate-pulse" : "text-[#0d9488]"}>
                {isOverCanvas ? "🎯 THẢ VÀO ĐÂY ĐỂ THÊM" : "Kéo phần tử từ cột bên trái thả vào đây"}
              </span>
            </div>

            {blocks.length === 0 ? (
              <div className="h-64 border-2 border-dashed border-teal-300 bg-teal-50/50 rounded-2xl flex flex-col items-center justify-center text-stone-500 text-xs gap-2">
                <GripVertical className="w-8 h-8 text-[#0d9488] animate-bounce" />
                <p className="font-bold text-stone-700 uppercase">KÉO VÀ THẢ PHẦN TỬ VÀO ĐÂY</p>
                <p className="text-[11px] text-stone-400">(Không thể click chọn - Phải giữ chuột kéo sang)</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, index) => {
                  const isSelected = activeBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => handleCanvasBlockDragStart(e, index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleCanvasBlockDrop(e, index)}
                      onClick={() => setActiveBlockId(block.id)}
                      style={{
                        backgroundColor: block.bgColor || "#ffffff",
                        color: block.textColor || "#0f172a",
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? "border-[#0d9488] ring-2 ring-teal-100 shadow-xl"
                          : "border-stone-200 hover:border-stone-300 shadow-xs"
                      }`}
                    >
                      {/* Control Bar Header */}
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200/50 text-xs font-mono">
                        <span className="font-bold uppercase text-[#0d9488] flex items-center gap-1.5">
                          <GripVertical size={14} className="cursor-grab text-stone-400" />
                          <span className="w-4 h-4 rounded-full bg-teal-100 text-[#0d9488] flex items-center justify-center text-[9px]">
                            {index + 1}
                          </span>
                          {block.type === "form"
                            ? "📋 Form Tùy Biến Trường"
                            : block.type === "vietqr"
                            ? "💳 Thanh Toán VietQR"
                            : block.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(index, "up");
                            }}
                            disabled={index === 0}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(index, "down");
                            }}
                            disabled={index === blocks.length - 1}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlock(block.id);
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Visual Simulation of Blocks */}
                      <div>
                        {block.type === "form" ? (
                          <div className="space-y-3 pointer-events-none">
                            <h4 className="font-bold text-sm">{block.title || "Form Đăng Ký"}</h4>
                            <p className="text-xs text-stone-500">{block.subtitle}</p>
                            <div className="space-y-2 pt-2">
                              {(block.formFields || []).map((f) => (
                                <div key={f.id} className="text-[11px]">
                                  <label className="font-semibold block mb-0.5">
                                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                                  </label>
                                  {f.type === "textarea" ? (
                                    <div className="w-full h-12 bg-stone-50 border rounded-lg p-2 text-stone-400">
                                      {f.placeholder}
                                    </div>
                                  ) : (
                                    <div className="w-full h-8 bg-stone-50 border rounded-lg px-2 flex items-center text-stone-400">
                                      {f.placeholder}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <button
                                style={{ backgroundColor: block.primaryColor || "#0d9488" }}
                                className="w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-sm mt-2"
                              >
                                {block.ctaText || "GỬI ĐĂNG KÝ"}
                              </button>
                            </div>
                          </div>
                        ) : block.type === "hero" ? (
                          <div className="text-center space-y-2 py-4 pointer-events-none">
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase">
                              {block.badge || "Hero Banner"}
                            </span>
                            <h3 className="font-extrabold text-base">{block.title}</h3>
                            <p className="text-xs opacity-90">{block.subtitle}</p>
                          </div>
                        ) : (
                          <div className="pointer-events-none">
                            <h4 className="font-bold text-xs">{block.title}</h4>
                            <p className="text-[11px] opacity-75">{block.subtitle}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
