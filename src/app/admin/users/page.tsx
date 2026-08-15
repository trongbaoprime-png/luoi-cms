"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  CheckCircle2,
  Lock,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Building2,
  PhoneCall,
  Bot,
  Cpu,
  BarChart3,
  Search,
  Filter,
  Layers,
  Sparkles,
  DollarSign,
  FileSpreadsheet,
  Megaphone,
  Inbox,
  UserX,
} from "lucide-react";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string; // JSON string of permission keys
  status: "ACTIVE" | "INACTIVE" | string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  _count?: { posts: number };
}

export type PermissionType = "TABLE" | "CARD" | "ACTION" | "COLUMN";

export interface PermissionDef {
  key: string;
  label: string;
  category: string;
  type: PermissionType;
  description?: string;
}

export const ALL_MODULE_PERMISSIONS: PermissionDef[] = [
  // 1. MODULE LƯỜI CMS & SEO
  { key: "cms:articles:view", label: "Xem bảng Danh sách bài viết & bộ lọc", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "TABLE" },
  { key: "cms:articles:create", label: "Tạo bài viết mới & AI Content Writer", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "ACTION" },
  { key: "cms:articles:edit", label: "Chỉnh sửa bài viết & SEO Meta", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "ACTION" },
  { key: "cms:articles:delete", label: "Xóa bài viết khỏi CMS", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "ACTION" },
  { key: "cms:categories:manage", label: "Quản lý bảng Danh mục & Taxonomy", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "TABLE" },
  { key: "cms:pages:manage", label: "Quản lý bảng Trang tĩnh Landing Page", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "TABLE" },
  { key: "cms:products:manage", label: "Quản lý bảng Sản phẩm & Affiliate KOC", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "TABLE" },
  { key: "cms:deals:manage", label: "Quản lý bảng Voucher & Deal khuyến mãi", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "TABLE" },
  { key: "cms:media:manage", label: "Xem & Tải lên thư viện Media hình ảnh/video", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "ACTION" },
  { key: "cms:cards:overview", label: "Xem Card KPI tổng quan CMS (Bài viết, Lượt xem)", category: "1. 📝 MODULE LƯỜI CMS & SEO", type: "CARD" },

  // 2. MODULE META ADS & CHẨN ĐOÁN (MỚI BỔ SUNG ĐẦY ĐỦ)
  { key: "ads:campaigns:view", label: "Xem bảng Danh sách Chiến dịch, AdSets & Creatives", category: "2. 📊 MODULE META ADS & CHẨN ĐOÁN", type: "TABLE" },
  { key: "ads:diagnosis:view", label: "Xem Bảng & Card Chẩn đoán Bệnh lý Camp (12 Bệnh)", category: "2. 📊 MODULE META ADS & CHẨN ĐOÁN", type: "CARD" },
  { key: "ads:diagnosis:apply", label: "Thực thi khuyến nghị & Tối ưu chiến dịch", category: "2. 📊 MODULE META ADS & CHẨN ĐOÁN", type: "ACTION" },
  { key: "ads:accounts:manage", label: "Quản lý kết nối Tài khoản Ads & Đồng bộ dữ liệu", category: "2. 📊 MODULE META ADS & CHẨN ĐOÁN", type: "ACTION" },
  { key: "ads:forms:view", label: "Xem bảng Lead từ Meta Instant Forms", category: "2. 📊 MODULE META ADS & CHẨN ĐOÁN", type: "TABLE" },
  { key: "ads:cards:kpi", label: "Xem Card KPI Chi tiêu (Spend), CPR, CPL, CPR Khám", category: "2. 📊 MODULE META ADS & CHẨN ĐOÁN", type: "CARD" },
  { key: "ads:cards:wasted", label: "Xem Card Ước tính Tiền Lãng phí (Wasted Spend)", category: "2. 📊 MODULE META ADS & CHẨN ĐOÁN", type: "CARD" },
  { key: "ads:col:spend:view", label: "Xem Cột Chi phí Quảng cáo thực tế", category: "2. 📊 MODULE META ADS & CHẨN ĐOÁN", type: "COLUMN" },
  { key: "ads:col:roas:view", label: "Xem Cột Doanh thu / ROAS ước tính của chiến dịch", category: "2. 📊 MODULE META ADS & CHẨN ĐOÁN", type: "COLUMN" },

  // 3. MODULE MINICRM & TELESALE
  { key: "crm:leads:view", label: "Xem bảng Danh sách Khách hàng Lead (miniCRM)", category: "3. 📞 MODULE MINICRM & TELESALE", type: "TABLE" },
  { key: "crm:leads:create", label: "Thêm khách hàng Lead mới thủ công", category: "3. 📞 MODULE MINICRM & TELESALE", type: "ACTION" },
  { key: "crm:leads:edit", label: "Cập nhật Trạng thái, Chi nhánh, Telesale, Lịch hẹn", category: "3. 📞 MODULE MINICRM & TELESALE", type: "ACTION" },
  { key: "crm:leads:delete", label: "Xóa khách hàng Lead khỏi CRM", category: "3. 📞 MODULE MINICRM & TELESALE", type: "ACTION" },
  { key: "crm:notes:manage", label: "Xem & Thêm bảng Ghi chú CSKH / Cuộc gọi", category: "3. 📞 MODULE MINICRM & TELESALE", type: "TABLE" },
  { key: "crm:plan:manage", label: "Quản lý bảng Kế hoạch & KPI Doanh thu phòng khám", category: "3. 📞 MODULE MINICRM & TELESALE", type: "TABLE" },
  { key: "crm:cards:kpi", label: "Xem Card KPI Khách, Tỉ lệ Chốt (Qualified/Purchase)", category: "3. 📞 MODULE MINICRM & TELESALE", type: "CARD" },
  { key: "crm:cards:revenue", label: "Xem Card Doanh thu & Thực thu phòng khám", category: "3. 📞 MODULE MINICRM & TELESALE", type: "CARD" },
  { key: "crm:executive:access", label: "Truy cập Bàn làm việc Trợ Lý Sếp & Kanban", category: "3. 📞 MODULE MINICRM & TELESALE", type: "CARD" },
  { key: "crm:export:excel", label: "Tải file Excel / CSV danh sách Lead CRM", category: "3. 📞 MODULE MINICRM & TELESALE", type: "ACTION" },
  { key: "crm:col:revenue:view", label: "Xem Cột Doanh thu / Thực thu từng khách", category: "3. 📞 MODULE MINICRM & TELESALE", type: "COLUMN" },

  // 4. MODULE OMNICHANNEL 68 FANPAGES
  { key: "omni:inbox:access", label: "Truy cập Hộp thư Omnichannel 68 Fanpages", category: "4. 💬 MODULE OMNICHANNEL 68 FANPAGES", type: "TABLE" },
  { key: "omni:inbox:reply", label: "Nhắn tin trả lời & Tư vấn khách hàng đa kênh", category: "4. 💬 MODULE OMNICHANNEL 68 FANPAGES", type: "ACTION" },
  { key: "omni:copilot:use", label: "Sử dụng AI Copilot tạo kịch bản gợi ý", category: "4. 💬 MODULE OMNICHANNEL 68 FANPAGES", type: "ACTION" },
  { key: "omni:branch:assign", label: "Phân bổ Chi nhánh tiếp nhận & Telesale", category: "4. 💬 MODULE OMNICHANNEL 68 FANPAGES", type: "ACTION" },
  { key: "omni:pancake:sync", label: "Đồng bộ & Gắn thẻ Pancake (IMP, SỨ, DDH...)", category: "4. 💬 MODULE OMNICHANNEL 68 FANPAGES", type: "ACTION" },
  { key: "omni:crm:push", label: "Nút Đẩy khách hàng trực tiếp sang miniCRM", category: "4. 💬 MODULE OMNICHANNEL 68 FANPAGES", type: "ACTION" },
  { key: "omni:cards:analytics", label: "Xem Card KPI Hội thoại, Kênh chat, Tỉ lệ SĐT", category: "4. 💬 MODULE OMNICHANNEL 68 FANPAGES", type: "CARD" },

  // 5. MODULE KHÁCH ĐĂNG KÝ (RAW LEADS) & EMAIL SUBSCRIBERS
  { key: "rawleads:forms:view", label: "Xem bảng Form Đăng ký Landing Page", category: "5. 🎯 MODULE KHÁCH ĐĂNG KÝ (RAW LEADS)", type: "TABLE" },
  { key: "rawleads:channels:view", label: "Xem bảng Lượt Click Kênh (Zalo/Hotline/Messenger)", category: "5. 🎯 MODULE KHÁCH ĐĂNG KÝ (RAW LEADS)", type: "TABLE" },
  { key: "rawleads:subscribers:view", label: "Xem bảng Email Đăng ký nhận tin", category: "5. 🎯 MODULE KHÁCH ĐĂNG KÝ (RAW LEADS)", type: "TABLE" },
  { key: "rawleads:export", label: "Tải file CSV Khách đăng ký & Subscribers", category: "5. 🎯 MODULE KHÁCH ĐĂNG KÝ (RAW LEADS)", type: "ACTION" },

  // 6. MODULE TRACKING & AI INFRA
  { key: "tracking:sessions:view", label: "Xem bảng Phiên truy cập & Bản đồ UTM Tracking", category: "6. 🤖 MODULE TRACKING & AI INFRA", type: "TABLE" },
  { key: "tracking:pixel:manage", label: "Quản lý Pixel & Meta Conversions API (CAPI)", category: "6. 🤖 MODULE TRACKING & AI INFRA", type: "ACTION" },
  { key: "ai:gateway:manage", label: "Quản lý LiteLLM Gateway & API Keys", category: "6. 🤖 MODULE TRACKING & AI INFRA", type: "ACTION" },
  { key: "ai:agents:manage", label: "Quản lý AI Agents & OpenClaw Scraper", category: "6. 🤖 MODULE TRACKING & AI INFRA", type: "ACTION" },
  { key: "ai:secondbrain:access", label: "Truy cập Kho Tri thức Second Brain", category: "6. 🤖 MODULE TRACKING & AI INFRA", type: "TABLE" },

  // 7. BẢO MẬT DỮ LIỆU & CHE CỘT (COLUMN MASKING)
  { key: "privacy:phone:unmask", label: "Cho phép xem Số Điện Thoại đầy đủ (Không che số)", category: "7. 🔒 BẢO MẬT DỮ LIỆU & CHE CỘT (COLUMN MASKING)", type: "COLUMN" },
  { key: "privacy:email:unmask", label: "Cho phép xem Email đầy đủ (Không che email)", category: "7. 🔒 BẢO MẬT DỮ LIỆU & CHE CỘT (COLUMN MASKING)", type: "COLUMN" },
  { key: "privacy:revenue:unmask", label: "Cho phép xem Chi tiết Doanh thu thực tế", category: "7. 🔒 BẢO MẬT DỮ LIỆU & CHE CỘT (COLUMN MASKING)", type: "COLUMN" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("ADMIN");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    ALL_MODULE_PERMISSIONS.map((p) => p.key)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");

  const fetchUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        }
      })
      .catch((err) => console.error("Lỗi nạp users:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const toggleCategoryPermissions = (catName: string, selectAll: boolean) => {
    const catKeys = ALL_MODULE_PERMISSIONS.filter((p) => p.category === catName).map((p) => p.key);
    if (selectAll) {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...catKeys])));
    } else {
      setSelectedPermissions((prev) => prev.filter((k) => !catKeys.includes(k)));
    }
  };

  const setPreset = (presetRole: string) => {
    if (presetRole === "ADMIN" || presetRole === "SUPER_ADMIN") {
      setSelectedPermissions(ALL_MODULE_PERMISSIONS.map((p) => p.key));
    } else if (presetRole === "MARKETING") {
      // Marketing role gets Ads, Diagnosis, Raw Leads, Tracking, CRM insights, Omni analytics
      setSelectedPermissions([
        "ads:campaigns:view",
        "ads:diagnosis:view",
        "ads:diagnosis:apply",
        "ads:accounts:manage",
        "ads:forms:view",
        "ads:cards:kpi",
        "ads:cards:wasted",
        "ads:col:spend:view",
        "ads:col:roas:view",
        "rawleads:forms:view",
        "rawleads:channels:view",
        "rawleads:subscribers:view",
        "rawleads:export",
        "crm:leads:view",
        "crm:cards:kpi",
        "crm:cards:revenue",
        "crm:notes:manage",
        "omni:inbox:access",
        "omni:cards:analytics",
        "omni:pancake:sync",
        "tracking:sessions:view",
        "tracking:pixel:manage",
        "cms:articles:view",
        "cms:cards:overview",
        "privacy:phone:unmask",
        "privacy:email:unmask",
        "privacy:revenue:unmask",
      ]);
    } else if (presetRole === "CMS_EDITOR") {
      setSelectedPermissions(
        ALL_MODULE_PERMISSIONS.filter((p) => p.category.includes("CMS")).map((p) => p.key)
      );
    } else if (presetRole === "TELESALE_STAFF") {
      setSelectedPermissions([
        "crm:leads:view",
        "crm:leads:edit",
        "crm:notes:manage",
        "omni:inbox:access",
        "omni:inbox:reply",
        "omni:copilot:use",
        "omni:branch:assign",
      ]);
    } else if (presetRole === "CSKH_OMNICHANNEL") {
      setSelectedPermissions([
        "omni:inbox:access",
        "omni:inbox:reply",
        "omni:copilot:use",
        "omni:branch:assign",
        "omni:pancake:sync",
        "omni:crm:push",
        "crm:leads:view",
        "crm:leads:edit",
        "crm:notes:manage",
      ]);
    } else if (presetRole === "DEVOPS") {
      setSelectedPermissions([
        "ai:gateway:manage",
        "ai:agents:manage",
        "ai:secondbrain:access",
        "tracking:sessions:view",
        "tracking:pixel:manage",
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);

    try {
      const endpoint = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          role,
          permissions: JSON.stringify(selectedPermissions),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg(editingId ? "✓ Đã cập nhật phân quyền tài khoản thành công!" : "✓ Đã tạo tài khoản và lưu phân quyền mới!");
        setName("");
        setEmail("");
        setPassword("");
        setEditingId(null);
        fetchUsers();
      } else {
        setMsg("Lỗi: " + (data.error || "Thao tác thất bại"));
      }
    } catch (err: any) {
      setMsg("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const startEdit = (u: UserItem) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    try {
      if (u.permissions) {
        const parsed = JSON.parse(u.permissions);
        if (parsed.includes("*")) {
          setSelectedPermissions(ALL_MODULE_PERMISSIONS.map((p) => p.key));
        } else {
          setSelectedPermissions(parsed);
        }
      } else {
        setPreset(u.role);
      }
    } catch {
      setPreset(u.role);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const toggleStatus = async (u: UserItem) => {
    const nextStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchUsers();
  };

  const categories = useMemo(() => {
    return Array.from(new Set(ALL_MODULE_PERMISSIONS.map((p) => p.category)));
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole === "ALL" || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, filterRole]);

  const getTypeBadge = (type?: PermissionType) => {
    switch (type) {
      case "CARD":
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">CARD KPI</span>;
      case "TABLE":
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">BẢNG DỮ LIỆU</span>;
      case "COLUMN":
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">CỘT / BẢO MẬT</span>;
      case "ACTION":
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">HÀNH ĐỘNG</span>;
      default:
        return null;
    }
  };

  const getRoleBadgeStyle = (r: string) => {
    switch (r) {
      case "ADMIN":
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "MARKETING":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "CMS_EDITOR":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "TELESALE_STAFF":
      case "TELESALE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CSKH_OMNICHANNEL":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "DEVOPS":
        return "bg-slate-200 text-slate-800 border-slate-300";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-16 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0d4f4a]" />
            Quản Lý User &amp; Phân Quyền RBAC Theo 5 Module ({users.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Phân quyền chi tiết cho Lưới CMS, Meta Ads, miniCRM, Omnichannel 68 Fanpages, Raw Leads, AI Infra &amp; Bảo mật che cột SĐT/Doanh thu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#0d4f4a]/10 text-[#0d4f4a] px-3 py-1.5 rounded-xl font-bold border border-[#0d4f4a]/20 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            5 Module Độc Lập
          </span>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-[#0d4f4a]/10 text-[#0d4f4a] rounded-xl text-xs font-bold flex items-center gap-2 border border-[#0d4f4a]/30">
          <CheckCircle2 className="w-4 h-4 text-[#0d4f4a]" />
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= CỘT 1: FORM TẠO / SỬA USER & PHÂN QUYỀN (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 font-mono">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-100">
            <UserPlus className="w-5 h-5 text-[#0d4f4a]" />
            {editingId ? "Cập Nhật Tài Khoản & Phân Quyền" : "Tạo User Mới & Lưu Phân Quyền"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Họ &amp; Tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Trần Văn Marketing"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Đăng Nhập
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marketing@tamducsmile.vn"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                {editingId ? "Mật khẩu mới (Bỏ trống nếu giữ nguyên)" : "Mật khẩu *"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                required={!editingId}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                VAI TRÒ CHÍNH (ROLE PRESET)
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const val = e.target.value;
                  setRole(val);
                  setPreset(val);
                }}
                className="w-full px-3 py-2.5 border-2 border-[#0d4f4a] rounded-xl text-xs font-mono font-bold text-stone-900 bg-[#0d4f4a]/5 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] cursor-pointer"
              >
                <option value="ADMIN">ADMIN (Toàn quyền hệ thống)</option>
                <option value="MARKETING">MARKETING (Quảng Cáo Meta, Lead, CRM &amp; Omni)</option>
                <option value="CMS_EDITOR">CMS_EDITOR (Biên tập Lưới CMS &amp; SEO)</option>
                <option value="TELESALE_STAFF">TELESALE_STAFF (Nhân viên Telesale - Che SĐT &amp; Doanh thu)</option>
                <option value="CSKH_OMNICHANNEL">CSKH_OMNICHANNEL (Nhân viên CSKH Đa Kênh 68 Pages)</option>
                <option value="DEVOPS">DEVOPS (Kỹ thuật AI Infra &amp; Tracking)</option>
                <option value="CUSTOM">CUSTOM (Tùy chỉnh phân quyền tự do)</option>
              </select>
            </div>

            {/* Granular Permission Checkboxes Grouped by Module & Type */}
            <div className="pt-2 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#0d4f4a]" />
                  TÍCH CHỌN TÍNH NĂNG &amp; BẢNG / CỘT ĐƯỢC DÙNG ({selectedPermissions.length}/{ALL_MODULE_PERMISSIONS.length}):
                </label>
                <div className="flex gap-1.5 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions(ALL_MODULE_PERMISSIONS.map((p) => p.key))}
                    className="text-[#0d4f4a] font-bold hover:underline cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-stone-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([])}
                    className="text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    Bỏ hết
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1.5 border border-stone-200 rounded-xl p-3 bg-stone-50/70">
                {categories.map((cat) => {
                  const catPerms = ALL_MODULE_PERMISSIONS.filter((p) => p.category === cat);
                  const isPrivacyCat = cat.includes("BẢO MẬT");
                  const allCheckedInCat = catPerms.every((p) => selectedPermissions.includes(p.key));

                  return (
                    <div key={cat} className="space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1.5 ${
                            isPrivacyCat
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : cat.includes("ADS")
                              ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                              : cat.includes("MINICRM")
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : cat.includes("OMNICHANNEL")
                              ? "bg-sky-100 text-sky-900 border border-sky-200"
                              : "bg-stone-200/70 text-stone-800"
                          }`}
                        >
                          {cat}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleCategoryPermissions(cat, !allCheckedInCat)}
                          className="text-[10px] text-stone-500 hover:text-stone-900 font-bold underline cursor-pointer"
                        >
                          {allCheckedInCat ? "Bỏ chọn nhóm" : "Chọn nhóm"}
                        </button>
                      </div>

                      <div className="space-y-1 pl-0.5 pt-1">
                        {catPerms.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-center justify-between text-xs cursor-pointer p-1.5 rounded-lg transition-colors ${
                                isChecked ? "bg-stone-50 border border-stone-200" : "hover:bg-stone-50/50"
                              }`}
                            >
                              <span className="flex items-center gap-2 flex-1">
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-[#0d9488] shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-stone-400 shrink-0" />
                                )}
                                <span className={isChecked ? "font-semibold text-stone-900 text-xs leading-tight" : "text-stone-600 text-xs leading-tight"}>
                                  {perm.label}
                                </span>
                              </span>

                              <div className="shrink-0 ml-2">
                                {getTypeBadge(perm.type)}
                              </div>

                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                                className="hidden"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2 font-mono">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Đang lưu..."
                ) : editingId ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Cập Nhật Phân Quyền
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Tạo User &amp; Lưu Quyền
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="px-4 py-3 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ================= CỘT 2: DANH SÁCH TÀI KHOẢN & PHÂN QUYỀN MÔ-ĐUN (7 COLS) ================= */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#0d4f4a]" />
              Danh Sách Tài Khoản &amp; Phân Quyền Mô-đun ({filteredUsers.length})
            </h2>

            {/* Quick Search & Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0d4f4a] w-40 sm:w-48 font-mono"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 font-mono focus:outline-none focus:border-[#0d4f4a] cursor-pointer"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MARKETING">MARKETING</option>
                <option value="CMS_EDITOR">CMS_EDITOR</option>
                <option value="TELESALE_STAFF">TELESALE_STAFF</option>
                <option value="CSKH_OMNICHANNEL">CSKH_OMNICHANNEL</option>
                <option value="DEVOPS">DEVOPS</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <UserX className="w-10 h-10 mx-auto text-stone-300" />
                <p className="text-sm font-semibold">Chưa có tài khoản nào phù hợp bộ lọc</p>
                <p className="text-xs">Bạn có thể tạo tài khoản mới bằng form bên trái</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                let permList: string[] = [];
                try {
                  if (u.permissions) {
                    const parsed = JSON.parse(u.permissions);
                    if (parsed.includes("*")) {
                      permList = ALL_MODULE_PERMISSIONS.map((p) => p.key);
                    } else {
                      permList = parsed;
                    }
                  }
                } catch {}

                const canSeePhone = permList.includes("privacy:phone:unmask") || u.role === "ADMIN" || u.role === "SUPER_ADMIN";
                const canSeeRevenue = permList.includes("privacy:revenue:unmask") || u.role === "ADMIN" || u.role === "SUPER_ADMIN";

                return (
                  <div
                    key={u.id}
                    className="py-4 space-y-3 hover:bg-stone-50/80 px-3 rounded-xl border border-transparent hover:border-stone-200 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0d4f4a]/10 border border-[#0d4f4a]/20 flex items-center justify-center font-bold text-sm text-[#0d4f4a] shrink-0">
                          {u.name ? u.name.slice(0, 2).toUpperCase() : "US"}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-stone-900 text-sm">{u.name}</h3>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getRoleBadgeStyle(u.role)}`}>
                              {u.role}
                            </span>
                            <button
                              onClick={() => toggleStatus(u)}
                              className={`text-[10px] px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                                u.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                              }`}
                            >
                              {u.status === "ACTIVE" ? "🟢 Hoạt động" : "🔴 Tạm khóa"}
                            </button>
                          </div>
                          <p className="text-xs text-stone-500 font-mono mt-0.5">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Security Masking Indicator */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold ${
                            canSeePhone ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {canSeePhone ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {canSeePhone ? "Thấy SĐT" : "Che SĐT"}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold ${
                            canSeeRevenue ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <DollarSign className="w-3 h-3" />
                          {canSeeRevenue ? "Thấy Doanh Thu" : "Che Doanh Thu"}
                        </span>

                        <button
                          onClick={() => startEdit(u)}
                          className="p-2 text-stone-600 hover:text-[#0d9488] hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
                          title="Chỉnh sửa phân quyền"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Active Permission Badges */}
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-stone-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Đã cấp {permList.length}/{ALL_MODULE_PERMISSIONS.length} quyền mô-đun:
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {permList.length === 0 ? (
                          <span className="text-[11px] text-stone-400 italic">Chưa cấp quyền nào</span>
                        ) : (
                          permList.map((pKey) => {
                            const info = ALL_MODULE_PERMISSIONS.find((ap) => ap.key === pKey);
                            const isPrivacy = pKey.includes("privacy");
                            const isAds = pKey.includes("ads");
                            const isCrm = pKey.includes("crm");
                            const isOmni = pKey.includes("omni");

                            return (
                              <span
                                key={pKey}
                                className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                                  isPrivacy
                                    ? "bg-amber-50 text-amber-900 border-amber-200"
                                    : isAds
                                    ? "bg-indigo-50 text-indigo-900 border-indigo-200"
                                    : isCrm
                                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                                    : isOmni
                                    ? "bg-sky-50 text-sky-900 border-sky-200"
                                    : "bg-white text-stone-700 border-stone-200"
                                }`}
                              >
                                {info?.label || pKey}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
