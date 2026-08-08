"use client";

import { useState, useEffect } from "react";
import { UserCheck, UserPlus, Shield, Trash2, Edit2, CheckCircle2, Lock, CheckSquare, Square, Eye, EyeOff, Building2, PhoneCall, Bot, Cpu } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string; // JSON string of permission keys
  status: "ACTIVE" | "INACTIVE" | string;
  bio?: string;
  createdAt: string;
  _count?: { posts: number };
}

export interface PermissionDef {
  key: string;
  label: string;
  category: "MODULE LƯỚI CMS" | "MODULE MINICRM" | "MODULE OMNICHANNEL" | "MODULE AI INFRA" | "BẢO MẬT DỮ LIỆU KHÁCH HÀNG";
}

export const ALL_MODULE_PERMISSIONS: PermissionDef[] = [
  // 1. MODULE LƯỚI CMS
  { key: "articles:read", label: "Xem bài viết", category: "MODULE LƯỚI CMS" },
  { key: "articles:create", label: "Tạo bài viết mới", category: "MODULE LƯỚI CMS" },
  { key: "articles:edit", label: "Sửa bài viết", category: "MODULE LƯỚI CMS" },
  { key: "articles:delete", label: "Xóa bài viết", category: "MODULE LƯỚI CMS" },
  { key: "categories:manage", label: "Quản lý danh mục Taxonomy", category: "MODULE LƯỚI CMS" },
  { key: "products:manage", label: "Quản lý sản phẩm Affiliate", category: "MODULE LƯỚI CMS" },
  { key: "deals:manage", label: "Quản lý Voucher & Deal", category: "MODULE LƯỚI CMS" },
  { key: "pages:manage", label: "Quản lý trang tĩnh Landing Page", category: "MODULE LƯỚI CMS" },
  { key: "media:upload", label: "Tải lên & Quản lý thư viện Media", category: "MODULE LƯỚI CMS" },

  // 2. MODULE MINICRM
  { key: "crm:leads:read", label: "Xem danh sách Lead (miniCRM)", category: "MODULE MINICRM" },
  { key: "crm:leads:edit", label: "Cập nhật trạng thái & Note Lead", category: "MODULE MINICRM" },
  { key: "crm:leads:delete", label: "Xóa Lead CRM", category: "MODULE MINICRM" },
  { key: "crm:revenue:view", label: "Xem báo cáo Doanh Thu & Thực Thu", category: "MODULE MINICRM" },
  { key: "crm:export", label: "Tải file Excel / CSV danh sách Lead", category: "MODULE MINICRM" },
  { key: "crm:executive:access", label: "Truy cập Trợ Lý Sếp & Kanban Tổng Hợp", category: "MODULE MINICRM" },

  // 3. MODULE OMNICHANNEL
  { key: "omnichannel:access", label: "Truy cập Hộp thư Omnichannel 60 Fanpages", category: "MODULE OMNICHANNEL" },
  { key: "omnichannel:reply", label: "Nhắn tin tư vấn khách hàng đa kênh", category: "MODULE OMNICHANNEL" },
  { key: "omnichannel:pancake:sync", label: "Đồng bộ & Gắn thẻ Pancake", category: "MODULE OMNICHANNEL" },
  { key: "omnichannel:assign", label: "Phân công Fanpage / Chi nhánh", category: "MODULE OMNICHANNEL" },

  // 4. MODULE AI INFRA
  { key: "ai:gateway:manage", label: "Cấu hình LiteLLM Proxy & AI Keys", category: "MODULE AI INFRA" },
  { key: "ai:openclaw:manage", label: "Quản lý OpenClaw Agent & Scraper", category: "MODULE AI INFRA" },
  { key: "ai:secondbrain:access", label: "Truy cập Thư viện Tri thức Second Brain", category: "MODULE AI INFRA" },

  // 5. BẢO MẬT DỮ LIỆU KHÁCH HÀNG (DATA PRIVACY)
  { key: "privacy:phone:unmask", label: "Cho phép xem Số Điện Thoại đầy đủ (Không che số)", category: "BẢO MẬT DỮ LIỆU KHÁCH HÀNG" },
  { key: "privacy:email:unmask", label: "Cho phép xem Email đầy đủ", category: "BẢO MẬT DỮ LIỆU KHÁCH HÀNG" },
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

  const fetchUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.data);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const setPreset = (presetRole: string) => {
    if (presetRole === "ADMIN") {
      setSelectedPermissions(ALL_MODULE_PERMISSIONS.map((p) => p.key));
    } else if (presetRole === "CMS_EDITOR") {
      setSelectedPermissions(
        ALL_MODULE_PERMISSIONS.filter((p) => p.category === "MODULE LƯỚI CMS").map((p) => p.key)
      );
    } else if (presetRole === "TELESALE_STAFF") {
      setSelectedPermissions([
        "crm:leads:read",
        "crm:leads:edit",
        "omnichannel:access",
        "omnichannel:reply",
        "omnichannel:pancake:sync",
      ]);
    } else if (presetRole === "CSKH_OMNICHANNEL") {
      setSelectedPermissions([
        "omnichannel:access",
        "omnichannel:reply",
        "omnichannel:pancake:sync",
        "crm:leads:read",
      ]);
    } else if (presetRole === "DEVOPS") {
      setSelectedPermissions([
        "ai:gateway:manage",
        "ai:openclaw:manage",
        "ai:secondbrain:access",
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
        setMsg(editingId ? "✓ Đã cập nhật phân quyền user!" : "✓ Đã tạo user mới!");
        setName("");
        setEmail("");
        setPassword("");
        setEditingId(null);
        fetchUsers();
      } else {
        setMsg("Lỗi: " + (data.error || "Thất bại"));
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const startEdit = (u: UserItem) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    try {
      if (u.permissions) {
        setSelectedPermissions(JSON.parse(u.permissions));
      } else {
        setPreset(u.role);
      }
    } catch {
      setPreset("CMS_EDITOR");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
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

  const categories = [
    "MODULE LƯỚI CMS",
    "MODULE MINICRM",
    "MODULE OMNICHANNEL",
    "MODULE AI INFRA",
    "BẢO MẬT DỮ LIỆU KHÁCH HÀNG",
  ] as const;

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0d4f4a]" />
            Quản Lý User &amp; Phân Quyền RBAC Theo 4 Module ({users.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Phân quyền chi tiết cho Lưới CMS, miniCRM, Omnichannel, AI Infra &amp; Khóa bảo mật che SĐT khách hàng
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-[#0d4f4a]/10 text-[#0d4f4a] rounded-xl text-xs font-bold flex items-center gap-2 border border-[#0d4f4a]/30">
          <CheckCircle2 className="w-4 h-4 text-[#0d4f4a]" />
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* User & Permissions Form */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 font-mono">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#0d4f4a]" />
            {editingId ? "Cập Nhật Tài Khoản & Phân Quyền" : "Tạo User & Lưu Quyền"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Họ &amp; Tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@luoidonnha.com"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
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
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                VAI TRÒ CHÍNH (ROLE)
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const val = e.target.value;
                  setRole(val);
                  setPreset(val);
                }}
                className="w-full px-3 py-2 border-2 border-[#0d4f4a] rounded-xl text-xs font-mono font-bold text-stone-900 bg-[#0d4f4a]/5 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
              >
                <option value="ADMIN">ADMIN (Toàn quyền hệ thống)</option>
                <option value="CMS_EDITOR">CMS_EDITOR (Biên tập Lưới CMS)</option>
                <option value="TELESALE_STAFF">TELESALE_STAFF (Nhân viên Telesale - Che SĐT)</option>
                <option value="CSKH_OMNICHANNEL">CSKH_OMNICHANNEL (Nhân viên CSKH Đa Kênh - Che SĐT)</option>
                <option value="DEVOPS">DEVOPS (Kỹ thuật AI Infra)</option>
              </select>
            </div>

            {/* Granular Permission Checkboxes */}
            <div className="pt-2 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#0d4f4a]" />
                  TÍCH CHỌN TÍNH NĂNG ĐƯỢC PHÉP DÙNG:
                </label>
                <div className="flex gap-1 text-[11px] font-mono">
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
                    className="text-rose-600 font-semibold hover:underline"
                  >
                    Bỏ hết
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 border rounded-lg p-3 bg-stone-50/50">
                {categories.map((cat) => {
                  const catPerms = ALL_MODULE_PERMISSIONS.filter((p) => p.category === cat);
                  const isPrivacyCat = cat === "BẢO MẬT DỮ LIỆU KHÁCH HÀNG";
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1.5 ${
                        isPrivacyCat ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-stone-200/70 text-stone-800"
                      }`}>
                        {cat === "MODULE LƯỚI CMS" && <Building2 className="w-3.5 h-3.5 text-blue-600" />}
                        {cat === "MODULE MINICRM" && <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />}
                        {cat === "MODULE OMNICHANNEL" && <Bot className="w-3.5 h-3.5 text-purple-600" />}
                        {cat === "MODULE AI INFRA" && <Cpu className="w-3.5 h-3.5 text-rose-600" />}
                        {isPrivacyCat && <EyeOff className="w-3.5 h-3.5 text-amber-700" />}
                        {cat}
                      </div>
                      <div className="space-y-1 pl-1">
                        {catPerms.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-center justify-between text-xs cursor-pointer p-1.5 rounded transition-colors ${
                                isChecked ? "bg-white shadow-xs border border-stone-200" : "hover:bg-white/80"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-[#0d9488]" />
                                ) : (
                                  <Square className="w-4 h-4 text-stone-400" />
                                )}
                                <span className={isChecked ? "font-semibold text-stone-900" : "text-stone-600"}>
                                  {perm.label}
                                </span>
                              </span>
                              {perm.key.includes("phone:unmask") && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-700">
                                  Bảo mật cao
                                </span>
                              )}
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
                className="flex-1 py-3 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                {loading ? "Đang lưu..." : editingId ? "Cập Nhật User & Phân Quyền" : "Tạo User & Lưu Quyền"}
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
                  className="px-4 py-3 border rounded-lg text-stone-600 hover:bg-stone-50 text-sm font-medium"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Users List Table */}
        <div className="md:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-stone-800">Danh Sách Tài Khoản &amp; Phân Quyền Mô-đun ({users.length})</h2>
          <div className="divide-y divide-stone-100">
            {users.map((u) => {
              let permList: string[] = [];
              try {
                if (u.permissions) permList = JSON.parse(u.permissions);
              } catch {}

              const canSeePhone = permList.includes("privacy:phone:unmask") || u.role === "ADMIN";

              return (
                <div key={u.id} className="py-4 space-y-2.5 hover:bg-stone-50/80 px-3 rounded-lg border border-transparent hover:border-stone-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-[#0d9488]" />
                          {u.name}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "TELESALE_STAFF"
                              ? "bg-amber-100 text-amber-800"
                              : u.role === "CSKH_OMNICHANNEL"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {u.role}
                        </span>
                        <button
                          onClick={() => toggleStatus(u)}
                          className={`text-xs px-2 py-0.5 rounded font-medium cursor-pointer ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {u.status}
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 font-mono mt-0.5">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-bold ${
                        canSeePhone ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {canSeePhone ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {canSeePhone ? "Thấy SĐT" : "Che SĐT"}
                      </span>
                      <button
                        onClick={() => startEdit(u)}
                        className="p-1.5 text-stone-600 hover:text-[#0d9488] hover:bg-stone-100 rounded"
                        title="Chỉnh sửa phân quyền"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Allowed Features Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[11px] font-semibold text-stone-500 mr-1">Tùy chọn quyền:</span>
                    {permList.length === 0 ? (
                      <span className="text-[11px] text-stone-400 italic">Chưa cấp quyền</span>
                    ) : (
                      permList.map((pKey) => {
                        const info = ALL_MODULE_PERMISSIONS.find((ap) => ap.key === pKey);
                        const isPrivacy = pKey.includes("privacy");
                        return (
                          <span
                            key={pKey}
                            className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                              isPrivacy ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {info?.label || pKey}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
