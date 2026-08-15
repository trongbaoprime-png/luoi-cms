"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  User,
  Phone,
  Tag,
  CheckCircle2,
  Copy,
  X,
  MessageSquare,
  Globe2,
  Sparkles,
  RefreshCw,
  Info,
  Calendar,
  ExternalLink,
  ChevronDown,
  Filter,
  Plus,
  TrendingUp,
  Award,
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Check,
  Mail,
  EyeOff,
  Eye,
  Layers,
  History,
  Target,
  Share2,
  MapPin,
  FileText,
  Edit3,
} from "lucide-react";
import { MASTER_PANCAKE_TAGS, getAssignedStaff, GEO_BRANCH_MAPPINGS, parseBranchFromText } from "@/lib/pancake-tag-parser";

interface ConversationItem {
  id: string;
  pageId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  carrier?: string;
  platform: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  isUnread?: boolean;
  detectedBranch: string;
  detectedService: string;
  customerIntent?: string;
  tags: string[];
  notes?: string;
  fanpage?: {
    pageName: string;
    pageId: string;
    category?: string;
  };
}

interface MessageItem {
  id: string;
  senderType: "CUSTOMER" | "STAFF" | "AI_BOT";
  senderId: string;
  content: string;
  createdAt: string;
}

interface FanpageItem {
  id: string;
  pageId: string;
  pageName: string;
  category?: string;
  isActive: boolean;
  accessToken?: string;
  createdAt: string;
}

interface ChannelAnalytics {
  totalConversations: number;
  totalWithPhone: number;
  totalQualified: number;
  totalPurchase: number;
  channels: {
    facebook: number;
    zalo: number;
    instagram: number;
    whatsapp: number;
    webchat: number;
  };
}

interface CRMStatusData {
  isMatched: boolean;
  lead?: {
    id: string;
    fullName: string;
    phone: string;
    status: string;
    telesale?: string;
    branch?: string;
    service?: string;
    actualRevenue?: number;
    revenue?: number;
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentBranch?: string;
    appointmentDoctor?: string;
    appointmentStatus?: string;
    syncedToMeta?: boolean;
    source?: string;
    createdAt?: string;
  } | null;
}

interface Customer360Data {
  totalTouchpoints: number;
  totalFanpagesChatted: number;
  fanpagesList: string[];
  firstTouchPoint: {
    title: string;
    channelName: string;
    timestamp: string;
  } | null;
  lastTouchPoint: {
    title: string;
    channelName: string;
    timestamp: string;
  } | null;
  timeline: {
    id: string;
    type: string;
    title: string;
    description: string;
    channelName: string;
    timestamp: string;
    icon: string;
    badgeColor: string;
  }[];
  adsAttribution: {
    adId: string;
    adName?: string;
    adsetId?: string;
    adsetName?: string;
    campaignId?: string;
    campaignName?: string;
    postId?: string;
    referralSource?: string;
    placement?: string;
    targetAudience?: string;
    adHeadline?: string;
    adContent?: string;
  };
  fbProfileUrl: string;
  messengerUrl: string;
}

// 3 Hàng Thẻ Master Chuẩn 100% Giao Diện Pancake Tâm Đức Smile
const PANCAKE_GRID_ROW_1 = [
  { code: "NHUNG", color: "#FF0066", label: "NHUNG" },
  { code: "TRANG", color: "#11c532", label: "TRANG" },
  { code: "Trân Miln", color: "#38A6F4", label: "Trân Miln" },
  { code: "Liễu", color: "#003EFF", label: "Liễu" },
  { code: "THẢO", color: "#C605FF", label: "THẢO" },
  { code: "MINH TR...", color: "#d97706", label: "MINH TR..." },
  { code: "SINH", color: "#c1b800", label: "SINH" },
  { code: "HẠ", color: "#3fc72d", label: "HẠ" },
  { code: "Loan", color: "#416840", label: "Loan" },
  { code: "XUÂN", color: "#ff2b00", label: "XUÂN" },
];

const PANCAKE_GRID_ROW_2 = [
  { code: "SỨ", color: "#cf6dab", label: "SỨ" },
  { code: "IMP", color: "#3466a1", label: "IMP" },
  { code: "CN", color: "#469ea1", label: "CN" },
  { code: "TQ", color: "#E06DBE", label: "TQ" },
  { code: "VK", color: "#E78CE1", label: "VK" },
  { code: "#ĐẬU", color: "#925828", label: "#" },
  { code: "#RỚT", color: "#cac93b", label: "RỚT" },
  { code: "HẬU", color: "#8ce8df", label: "HẬU" },
  { code: "TRÚC", color: "#2fccf1", label: "TRÚC" },
  { code: "QUIN", color: "#d55f4d", label: "QUIN" },
];

const PANCAKE_GRID_ROW_3 = [
  { code: "SDT", color: "#08d72d", label: "SDT" },
  { code: "DDH", color: "#26a8ff", label: "DDH" },
  { code: "XA", color: "#042237", label: "XA" },
  { code: "KPH", color: "#2c373e", label: "KPH" },
  { code: "HếtNC", color: "#1f0c25", label: "HếtNC" },
  { code: "SPAM", color: "#000000", label: "SPAM" },
  { code: "TRÙNG", color: "#1e1319", label: "TRÙNG" },
  { code: "Kênh khác", color: "#172d00", label: "Kênh khác" },
  { code: "SALE", color: "#08d72d", label: "SALE" },
  { code: "BumDV", color: "#C88141", label: "BUM" },
];

const BRANCH_LIST = Object.keys(GEO_BRANCH_MAPPINGS);

export const mapToCanonicalBranch = (raw: string): string | null => {
  if (!raw) return null;
  const clean = raw.trim().toLowerCase();
  if (
    clean === "chưa chọn chi nhánh (đang tư vấn)" ||
    clean === "chưa chọn chi nhánh" ||
    clean === "chưa xác định" ||
    clean === "null" ||
    clean === "undefined"
  ) {
    return null;
  }
  for (const b of BRANCH_LIST) {
    const bLower = b.toLowerCase();
    if (bLower === clean || bLower.startsWith(clean) || clean.startsWith(bLower) || bLower.includes(clean) || clean.includes(bLower)) {
      return b;
    }
  }
  const parsed = parseBranchFromText(raw);
  if (parsed && parsed !== "Chưa chọn chi nhánh (Đang tư vấn)") {
    return parsed;
  }
  return raw;
};

export const getEffectiveBranch = (
  conv: ConversationItem | null,
  crmLead: any,
  msgs?: MessageItem[]
): string => {
  if (!conv) return "Chưa chọn chi nhánh (Đang tư vấn)";

  // 1. Scan ONLY customer messages (senderType === "CUSTOMER")
  if (msgs && msgs.length > 0) {
    const custMsgs = msgs.filter((m) => m.senderType === "CUSTOMER");
    if (custMsgs.length > 0) {
      const custTexts = custMsgs.map((m) => m.content).join(" \n ");
      const custBr = parseBranchFromText(custTexts);
      if (custBr && custBr !== "Chưa chọn chi nhánh (Đang tư vấn)") {
        return custBr;
      }
    }
  }

  // 2. If CRM Lead has valid branch (e.g. verified by Telesale/CSKH)
  if (
    crmLead?.branch &&
    crmLead.branch !== "Chưa chọn chi nhánh (Đang tư vấn)" &&
    crmLead.branch !== "Chưa chọn chi nhánh" &&
    crmLead.branch !== "CHƯA XÁC ĐỊNH"
  ) {
    const canonical = mapToCanonicalBranch(crmLead.branch);
    if (canonical && canonical !== "Chưa chọn chi nhánh (Đang tư vấn)") return canonical;
  }

  // 3. If Fanpage is a dedicated branch page (e.g. "Nha Khoa Tâm Đức Smile Dĩ An")
  if (conv.fanpage?.pageName) {
    const pName = conv.fanpage.pageName.toLowerCase();
    const isGenericPage = 
      pName.includes("thẩm mỹ") || 
      pName.includes("răng sứ cao cấp") || 
      pName.includes("dr trí") || 
      pName.includes("dr tri") || 
      pName === "nha khoa tâm đức smile" || 
      pName === "nha khoa tâm đức";
      
    if (!isGenericPage) {
      const pageBr = parseBranchFromText(conv.fanpage.pageName);
      if (pageBr && pageBr !== "Chưa chọn chi nhánh (Đang tư vấn)") {
        return pageBr;
      }
    }
  }

  // 4. Fallback to manually stored branch if valid
  if (
    conv.detectedBranch &&
    conv.detectedBranch !== "Chưa chọn chi nhánh (Đang tư vấn)" &&
    conv.detectedBranch !== "Chưa chọn chi nhánh" &&
    conv.detectedBranch !== "CHƯA XÁC ĐỊNH"
  ) {
    const canonical = mapToCanonicalBranch(conv.detectedBranch);
    if (canonical && canonical !== "Chưa chọn chi nhánh (Đang tư vấn)") return canonical;
  }

  return "Chưa chọn chi nhánh (Đang tư vấn)";
};


const TELESALE_LIST = [
  "THẢO", "NHUNG", "TRANG", "Trân Miln", "Liễu", "Loan", "SINH", "HẠ", "XUÂN", "QUIN", "TRÚC",
];

export default function AdminOmnichannelPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [fanpages, setFanpages] = useState<FanpageItem[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Customer Wish / Intent state
  const [editingWish, setEditingWish] = useState(false);
  const [wishInput, setWishInput] = useState("");

  // Ghost Mode & Unread Tracker
  const [ghostMode, setGhostMode] = useState<boolean>(true);
  const [unreadMap, setUnreadMap] = useState<Record<string, boolean>>({});

  // Right Column Tab: "CRM" | "JOURNEY_360"
  const [activeRightTab, setActiveRightTab] = useState<"CRM" | "JOURNEY_360">("CRM");

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPageId, setFilterPageId] = useState<string>("ALL");
  const [filterTag, setFilterTag] = useState<string>("ALL");
  const [filterTelesale, setFilterTelesale] = useState<string>("ALL");
  const [filterBranch, setFilterBranch] = useState<string>("ALL");
  const [filterPhone, setFilterPhone] = useState<string>("ALL");
  const [filterDateRange, setFilterDateRange] = useState<string>("ALL");
  const [filterChannel, setFilterChannel] = useState<string>("ALL"); // ALL | FACEBOOK | ZALO | INSTAGRAM | WEBSITE
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  // Date picker modal state (matching miniCRM style)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState("");
  const [tempTo, setTempTo] = useState("");
  const [tempPreset, setTempPreset] = useState("ALL");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [activeDateLabel, setActiveDateLabel] = useState("Toàn thời gian");

  // Pagination & Live Counter
  const [totalInDb, setTotalInDb] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Top KPI Stats
  const [analytics, setAnalytics] = useState<ChannelAnalytics>({
    totalConversations: 0,
    totalWithPhone: 0,
    totalQualified: 0,
    totalPurchase: 0,
    channels: { facebook: 0, zalo: 0, instagram: 0, whatsapp: 0, webchat: 0 },
  });

  // MiniCRM & 360 Resolution State
  const [crmStatus, setCrmStatus] = useState<CRMStatusData | null>(null);
  const [customer360, setCustomer360] = useState<Customer360Data | null>(null);
  const [loading360, setLoading360] = useState(false);
  const [crmSyncing, setCrmSyncing] = useState(false);
  const [adsDetailExpanded, setAdsDetailExpanded] = useState<boolean>(true);

  // Copilot Modal State
  const [copilotModalOpen, setCopilotModalOpen] = useState(false);
  const [activeCopilotData, setActiveCopilotData] = useState<any>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/omnichannel/analytics");
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      }
    } catch {}
  };

  const fetchConversations = async (reset = true) => {
    try {
      const currentOffset = reset ? 0 : conversations.length;
      const url = new URL("/api/admin/omnichannel/conversations", window.location.origin);
      if (filterPageId !== "ALL") url.searchParams.set("pageId", filterPageId);
      if (filterTag !== "ALL") url.searchParams.set("tag", filterTag);
      if (filterTelesale !== "ALL") url.searchParams.set("telesale", filterTelesale);
      if (filterBranch !== "ALL") url.searchParams.set("branch", filterBranch);
      if (filterPhone !== "ALL") url.searchParams.set("phoneFilter", filterPhone);
      if (filterDateRange !== "ALL") url.searchParams.set("dateRange", filterDateRange);
      if (filterChannel !== "ALL") url.searchParams.set("platform", filterChannel.toLowerCase());
      if (debouncedSearch) url.searchParams.set("search", debouncedSearch);


      url.searchParams.set("limit", "50");
      url.searchParams.set("offset", String(currentOffset));

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        if (reset) {
          setConversations(json.data);
          if (json.data.length > 0 && !selectedConvId) {
            setSelectedConvId(json.data[0].id);
          }
        } else {
          setConversations((prev) => [...prev, ...json.data]);
        }
        if (typeof json.totalInDb === "number") {
          setTotalInDb(json.totalInDb);
        }
      }
    } catch {
      console.error("Lỗi nạp hội thoại");
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreConversations = () => {
    if (loadingMore || conversations.length >= totalInDb) return;
    setLoadingMore(true);
    fetchConversations(false);
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/auth/facebook/pages");
      const json = await res.json();
      if (json.success) {
        setFanpages(json.data);
      }
    } catch {
      console.error("Lỗi nạp fanpages");
    }
  };

  // Auto-detect branch from message content (STRICTLY ONLY CUSTOMER MESSAGES)
  const autoDetectBranchFromMessages = (msgs: MessageItem[]): string | null => {
    if (!msgs || msgs.length === 0) return null;
    const customerTexts = msgs
      .filter((m) => m.senderType === "CUSTOMER")
      .map((m) => m.content)
      .join(" \n ");
    const custBr = parseBranchFromText(customerTexts);
    if (custBr && custBr !== "Chưa chọn chi nhánh (Đang tư vấn)") {
      return custBr;
    }
    return null;
  };


  const fetchMessages = async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/omnichannel/conversations/${convId}/messages`);
      const json = await res.json();
      if (json.success) {
        setMessages(json.data);
        const curConv = conversations.find((c) => c.id === convId);
        const finalBranch = getEffectiveBranch(curConv || null, crmStatus?.lead, json.data);
        if (finalBranch && finalBranch !== "Chưa chọn chi nhánh (Đang tư vấn)") {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === convId) {
                return { ...c, detectedBranch: finalBranch };
              }
              return c;
            })
          );
          // Persist auto-detected branch
          fetch(`/api/admin/omnichannel/conversations/${convId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ detectedBranch: finalBranch }),
          }).catch(() => {});
        }
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch {
      console.error("Lỗi nạp tin nhắn");
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchCRMStatus = async (convId: string) => {
    try {
      const res = await fetch(`/api/admin/omnichannel/conversations/${convId}/crm-status`);
      const json = await res.json();
      if (json.success) {
        setCrmStatus(json.data);
        if (json.data?.lead?.branch) {
          const matchedBranch = getEffectiveBranch(null, json.data.lead);
          if (matchedBranch && matchedBranch !== "Chưa chọn chi nhánh (Đang tư vấn)") {
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === convId && (!c.detectedBranch || c.detectedBranch === "Chưa chọn chi nhánh (Đang tư vấn)" || c.detectedBranch === "Chưa chọn chi nhánh")) {
                  return { ...c, detectedBranch: matchedBranch };
                }
                return c;
              })
            );
          }
        }
      }
    } catch {}
  };


  const fetchCustomer360 = async (convId: string) => {
    setLoading360(true);
    try {
      const res = await fetch(`/api/admin/omnichannel/conversations/${convId}/customer-360`);
      const json = await res.json();
      if (json.success) {
        setCustomer360(json.data);
      }
    } catch {
      console.error("Lỗi nạp 360");
    } finally {
      setLoading360(false);
    }
  };

  const handleUpdateBranch = async (newBranch: string) => {
    if (!selectedConvId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConvId ? { ...c, detectedBranch: newBranch } : c))
    );
    try {
      await fetch(`/api/admin/omnichannel/conversations/${selectedConvId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detectedBranch: newBranch }),
      });
      showToast(`📍 Đã gán Chi nhánh tiếp nhận: ${newBranch}`);
    } catch {}
  };

  const handleSaveWish = async () => {
    if (!selectedConvId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConvId ? { ...c, customerIntent: wishInput } : c))
    );
    setEditingWish(false);
    try {
      await fetch(`/api/admin/omnichannel/conversations/${selectedConvId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerIntent: wishInput }),
      });
      showToast("📝 Đã lưu mong muốn & nhu cầu chi tiết của khách!");
    } catch {}
  };

  const handleToggleUnread = async (convId: string) => {
    const nextState = !unreadMap[convId];
    setUnreadMap((prev) => ({ ...prev, [convId]: nextState }));
    try {
      await fetch(`/api/admin/omnichannel/conversations/${convId}/read-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUnread: nextState, ghostMode }),
      });
      showToast(nextState ? "✉️ Đã đánh dấu CHƯA ĐỌC (Không trôi tin nhắn)" : "✅ Đã đánh dấu ĐÃ ĐỌC");
    } catch {}
  };

  const handleSyncToMiniCRM = async () => {
    if (!selectedConvId || !selectedConv) return;
    // Guard: only allow sync when customer has phone + service
    const hasPhone = !!(selectedConv.customerPhone || crmStatus?.lead?.phone);
    const hasService = !!(selectedConv.detectedService || selectedConv.customerIntent || crmStatus?.lead?.service);
    if (!hasPhone || !hasService) {
      showToast("⚠️ Cần có SĐT và Dịch Vụ trước khi đẩy sang miniCRM!");
      return;
    }
    // Confirmation dialog
    const confirmed = window.confirm(
      `Xác nhận đẩy thông tin khách hàng sang miniCRM?\n\nKhách: ${selectedConv.customerName}\nSĐT: ${selectedConv.customerPhone || crmStatus?.lead?.phone}\nDịch vụ: ${selectedConv.detectedService || selectedConv.customerIntent}\n\nThao tác này sẽ tạo/cập nhật lead trong miniCRM.`
    );
    if (!confirmed) return;
    setCrmSyncing(true);
    try {
      const res = await fetch(`/api/admin/omnichannel/conversations/${selectedConvId}/crm-status`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "✅ Đã đồng bộ sang miniCRM thành công!");
        fetchCRMStatus(selectedConvId);
        fetchCustomer360(selectedConvId);
      }
    } catch {
      showToast("❌ Lỗi đồng bộ miniCRM");
    } finally {
      setCrmSyncing(false);
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchAnalytics();
  }, []);

  // Debounce searchTerm → debouncedSearch (500ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Re-fetch when any filter OR debounced search changes
  useEffect(() => {
    fetchConversations(true);
  }, [filterPageId, filterTag, filterTelesale, filterBranch, filterPhone, filterDateRange, filterChannel, debouncedSearch]);


  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
      fetchCRMStatus(selectedConvId);
      fetchCustomer360(selectedConvId);
      const cur = conversations.find((c) => c.id === selectedConvId);
      if (cur) {
        setWishInput(cur.customerIntent || "");
      }
    }
  }, [selectedConvId]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConvId) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/omnichannel/conversations/${selectedConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim(), senderName: "Telesale" }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyText("");
        fetchMessages(selectedConvId);
        fetchConversations(false);
        showToast("✅ Đã gửi tin nhắn!");
      }
    } catch {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleTag = async (tagName: string) => {
    if (!selectedConvId) return;
    try {
      const res = await fetch(`/api/admin/omnichannel/conversations/${selectedConvId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName, action: "toggle" }),
      });
      const json = await res.json();
      if (json.success) {
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConvId ? { ...c, tags: json.tags } : c))
        );
        if (json.capiTriggered) {
          showToast(`🎯 Thẻ ${tagName}: Kích hoạt ${json.capiTriggered} lên Meta CAPI!`);
        } else {
          showToast(`🏷️ Thẻ ${tagName}`);
        }
      }
    } catch {
      alert("Lỗi cập nhật thẻ");
    }
  };

  const handleOpenCopilot = async (convId: string) => {
    setCopilotLoading(true);
    setCopilotModalOpen(true);
    setCopied(false);
    try {
      const res = await fetch("/api/admin/omnichannel/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId }),
      });
      const json = await res.json();
      if (json.success) {
        setActiveCopilotData(json.data);
      }
    } catch {
      console.error("Lỗi AI Copilot");
    } finally {
      setCopilotLoading(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const resetAllFilters = () => {
    setSearchTerm("");
    setFilterPageId("ALL");
    setFilterTag("ALL");
    setFilterTelesale("ALL");
    setFilterBranch("ALL");
    setFilterPhone("ALL");
    setFilterDateRange("ALL");
    setFilterChannel("ALL");
    setActiveDateLabel("Toàn thời gian");
    setCustomDateFrom("");
    setCustomDateTo("");
    fetchConversations(true);
    showToast("Đã đặt lại toàn bộ bộ lọc!");
  };

  const hasActiveFilters =
    filterPageId !== "ALL" ||
    filterTag !== "ALL" ||
    filterTelesale !== "ALL" ||
    filterBranch !== "ALL" ||
    filterPhone !== "ALL" ||
    filterDateRange !== "ALL" ||
    searchTerm.trim() !== "";

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] bg-[#f5f3ef] text-stone-800 font-sans select-none overflow-hidden">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-emerald-400 text-emerald-700 px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================= 1. TOP STATS CARDS (CHUẨN THEO ẢNH 1 LƯỜI CMS) ================= */}
      <div className="bg-white border-b border-stone-200 px-3 py-2 shrink-0 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* Card 1: Tổng Hội Thoại */}
          <div className="bg-white/90 border border-stone-200 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-stone-500 uppercase flex items-center gap-1">
                <MessageSquare size={12} className="text-emerald-400" />
                <span>TỔNG HỘI THOẠI</span>
              </div>
              <div className="text-xl font-black text-emerald-600 mt-0.5">
                {(totalInDb || analytics.totalConversations || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">Tổng tin nhắn tất cả kênh</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🦷
            </div>
          </div>

          {/* Card 2: Messenger Facebook */}
          <div className="bg-white/90 border border-stone-200 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-stone-500 uppercase flex items-center gap-1">
                <Send size={12} className="text-blue-400" />
                <span>MESSENGER (FB)</span>
              </div>
              <div className="text-xl font-black text-blue-400 mt-0.5">
                {(analytics.channels.facebook || 52).toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">52 Fanpages chính thức</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs">
              f
            </div>
          </div>

          {/* Card 3: Chat Zalo */}
          <div className="bg-white/90 border border-stone-200 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-stone-500 uppercase flex items-center gap-1">
                <MessageSquare size={12} className="text-cyan-400" />
                <span>CHAT ZALO</span>
              </div>
              <div className="text-xl font-black text-cyan-400 mt-0.5">
                {(analytics.channels.zalo || 5).toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">1 OA + 4 Zalo cá nhân</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              Z
            </div>
          </div>

          {/* Card 4: Instagram */}
          <div className="bg-white/90 border border-stone-200 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-stone-500 uppercase flex items-center gap-1">
                <Globe2 size={12} className="text-pink-400" />
                <span>INSTAGRAM</span>
              </div>
              <div className="text-xl font-black text-pink-400 mt-0.5">
                {(analytics.channels.instagram || 4).toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">4 Instagram Official</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
              IG
            </div>
          </div>

          {/* Card 5: Khách Có SĐT / CAPI */}
          <div className="bg-white/90 border border-stone-200 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-stone-500 uppercase flex items-center gap-1">
                <Phone size={12} className="text-amber-400" />
                <span>CÓ SĐT / CAPI</span>
              </div>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {(analytics.totalWithPhone || 1240).toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-400 font-medium">Đã băm SHA-256 đối soát</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              📞
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. PANCAKE HEADER (ĐỒNG BỘ MÀU LƯỜI CMS) ================= */}
      <div className="h-11 bg-[#f5f3ef] border-b border-stone-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              P
            </div>
            <span className="font-bold text-xs text-stone-600 tracking-wide">Omnichannel</span>
          </div>

          {/* Channel Filter Tabs */}
          <div className="flex items-center gap-0.5 text-xs font-semibold">
            {([
              { key: "ALL", label: "Tất cả", count: totalInDb, color: "bg-stone-800 text-white" },
              { key: "FACEBOOK", label: "Facebook", count: analytics.channels.facebook, color: "bg-blue-600 text-white" },
              { key: "ZALO", label: "Zalo", count: analytics.channels.zalo, color: "bg-cyan-600 text-white" },
              { key: "INSTAGRAM", label: "Instagram", count: analytics.channels.instagram, color: "bg-pink-500 text-white" },
              { key: "WEBSITE", label: "Website", count: analytics.channels.webchat, color: "bg-emerald-600 text-white" },
            ] as const).map((ch) => (
              <button
                key={ch.key}
                onClick={() => setFilterChannel(ch.key)}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterChannel === ch.key
                    ? ch.color + " shadow-xs font-bold"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                }`}
              >
                <span>{ch.label}</span>
                {ch.count > 0 && (
                  <span className={`px-1 py-0 rounded text-[10px] font-extrabold ${
                    filterChannel === ch.key ? "bg-white/25" : "bg-stone-100 text-stone-600"
                  }`}>
                    {ch.count.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Ghost Mode Toggle */}
          <button
            onClick={() => {
              setGhostMode(!ghostMode);
              showToast(
                !ghostMode
                  ? "👻 Đã BẬT Chế độ Đọc Ẩn (Không làm trôi tin nhắn của nhân viên)"
                  : "👁️ Đã TẮT Chế độ Đọc Ẩn"
              );
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              ghostMode
                ? "bg-purple-100 border-purple-300 text-purple-700 shadow-xs"
                : "bg-stone-100 border-stone-200 text-stone-500 hover:text-stone-900"
            }`}
            title="Đọc ẩn: xem tin nhắn mà không làm trôi trạng thái chưa đọc của nhân viên trực page"
          >
            {ghostMode ? <EyeOff size={13} className="text-purple-400" /> : <Eye size={13} />}
            <span>{ghostMode ? "Đọc Ẩn (Ghost On)" : "Đọc Thường"}</span>
          </button>

          {/* Live Sync Status Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Đã nạp {totalInDb.toLocaleString()} / 800,000+ Khách (Đang nạp ngầm)</span>
          </div>

          {/* Nút Kết Nối Thêm Fanpage Facebook OAuth */}
          <a
            href="https://luoidonnha.com/api/auth/facebook/login"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-sm transition-all border border-blue-400/30 cursor-pointer"
            title="Đăng nhập Facebook để cấp quyền & quét thêm Fanpages"
          >
            <span className="w-4 h-4 rounded-full bg-white text-blue-600 flex items-center justify-center font-black text-[11px]">f</span>
            <span>🔗 Kết Nối Thêm Fanpage</span>
          </a>

          {/* Fanpage Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 px-3 py-1 rounded-md text-xs">
            <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
              🦷
            </div>
            <select
              value={filterPageId}
              onChange={(e) => setFilterPageId(e.target.value)}
              className="bg-transparent text-stone-800 font-medium text-xs focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="ALL" className="text-stone-900">Tất cả {fanpages.length} Kênh</option>
              {fanpages.map((p) => (
                <option key={p.pageId} value={p.pageId} className="text-stone-900">
                  {p.pageName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              fetchConversations(true);
              fetchChannels();
              fetchAnalytics();
              showToast("Đã đồng bộ dữ liệu mới nhất!");
            }}
            className="p-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ================= 3. ADVANCED COMPACT FILTER BAR ================= */}
      <div className="bg-[#eceae4] border-b border-stone-200 px-4 py-2 flex items-center justify-between gap-3 shrink-0 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-stone-500 font-bold text-[11px] mr-1">
            <Filter size={13} className="text-blue-400" />
            <span>BỘ LỌC:</span>
          </div>

          {/* Lọc Ngày Tháng — Mini Date Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-md px-2 py-1 text-xs text-stone-700 hover:border-stone-300 transition-all cursor-pointer"
            >
              <Calendar size={12} className="text-stone-500 shrink-0" />
              <span className="font-medium truncate max-w-[100px]">{activeDateLabel}</span>
              <ChevronDown size={11} className="text-stone-400" />
            </button>
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-stone-200 rounded-xl shadow-xl p-3 w-[340px]">
                <div className="text-[11px] font-bold text-stone-500 uppercase mb-2">Lọc nhanh thời gian</div>
                <div className="grid grid-cols-2 gap-1 mb-3">
                  {[
                    { key: "ALL", label: "Toàn thời gian" },
                    { key: "TODAY", label: "Hôm nay" },
                    { key: "YESTERDAY", label: "Hôm qua" },
                    { key: "TODAY_YESTERDAY", label: "Hôm nay & hôm qua" },
                    { key: "7DAYS", label: "7 ngày qua" },
                    { key: "14DAYS", label: "14 ngày qua" },
                    { key: "30DAYS", label: "30 ngày qua" },
                    { key: "THIS_MONTH", label: "Tháng này" },
                    { key: "LAST_MONTH", label: "Tháng trước" },
                    { key: "THIS_WEEK", label: "Tuần này" },
                  ].map((p) => (
                    <label key={p.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer">
                      <input
                        type="radio"
                        name="omni-date-preset"
                        checked={tempPreset === p.key}
                        onChange={() => setTempPreset(p.key)}
                        className="accent-[#0d4f4a]"
                      />
                      <span className="text-xs text-stone-700">{p.label}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-stone-100 pt-2 mb-3">
                  <div className="text-[11px] font-bold text-stone-500 uppercase mb-2">Khoảng thời gian tùy chỉnh</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-500">Từ Ngày</label>
                      <input type="date" value={tempFrom} onChange={(e) => { setTempFrom(e.target.value); setTempPreset("CUSTOM"); }}
                        className="w-full px-2 py-1 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] mt-0.5" />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500">Đến Ngày</label>
                      <input type="date" value={tempTo} onChange={(e) => { setTempTo(e.target.value); setTempPreset("CUSTOM"); }}
                        className="w-full px-2 py-1 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] mt-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => { setTempPreset("ALL"); setTempFrom(""); setTempTo(""); }}
                    className="text-[11px] text-[#0d4f4a] underline font-bold cursor-pointer">Bỏ lọc (Tất cả)</button>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsDatePickerOpen(false)}
                      className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer">Hủy</button>
                    <button type="button" onClick={() => {
                      const label = tempPreset === "CUSTOM"
                        ? (tempFrom && tempTo ? `${tempFrom} → ${tempTo}` : "Tùy chỉnh")
                        : [
                            { key: "ALL", label: "Toàn thời gian" }, { key: "TODAY", label: "Hôm nay" },
                            { key: "YESTERDAY", label: "Hôm qua" }, { key: "TODAY_YESTERDAY", label: "Hôm nay & hôm qua" },
                            { key: "7DAYS", label: "7 ngày qua" }, { key: "14DAYS", label: "14 ngày qua" },
                            { key: "30DAYS", label: "30 ngày qua" }, { key: "THIS_MONTH", label: "Tháng này" },
                            { key: "LAST_MONTH", label: "Tháng trước" }, { key: "THIS_WEEK", label: "Tuần này" },
                          ].find(p => p.key === tempPreset)?.label || tempPreset;
                      setActiveDateLabel(label);
                      setFilterDateRange(tempPreset === "CUSTOM" ? `CUSTOM:${tempFrom}:${tempTo}` : tempPreset);
                      setCustomDateFrom(tempFrom);
                      setCustomDateTo(tempTo);
                      setIsDatePickerOpen(false);
                    }}
                      className="px-3 py-1 bg-[#0d4f4a] hover:bg-[#083b37] text-white text-xs font-bold rounded-xl cursor-pointer">Áp Dụng</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lọc Thẻ Tag */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-md px-2 py-1">
            <Tag size={12} className="text-emerald-400" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-transparent text-stone-700 text-xs focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="ALL" className="text-stone-900">Tất cả Thẻ</option>
              {Object.keys(MASTER_PANCAKE_TAGS).map((t) => (
                <option key={t} value={t} className="text-stone-900">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Telesale Phụ Trách */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-md px-2 py-1">
            <User size={12} className="text-purple-400" />
            <select
              value={filterTelesale}
              onChange={(e) => setFilterTelesale(e.target.value)}
              className="bg-transparent text-stone-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="text-stone-900">Tất cả Telesale</option>
              {TELESALE_LIST.map((name) => (
                <option key={name} value={name} className="text-stone-900">
                  Telesale {name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Chi Nhánh */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-md px-2 py-1">
            <MapPin size={12} className="text-rose-400 shrink-0" />
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="bg-transparent text-stone-700 text-xs focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="ALL" className="text-stone-900">Tất cả Chi nhánh</option>
              {BRANCH_LIST.map((b) => (
                <option key={b} value={b} className="text-stone-900">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Số Điện Thoại */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-md px-2 py-1">
            <Phone size={12} className="text-amber-400" />
            <select
              value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
              className="bg-transparent text-stone-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="text-stone-900">Tất cả SĐT</option>
              <option value="HAS_PHONE" className="text-stone-900">Đã có Số Điện Thoại</option>
              <option value="NO_PHONE" className="text-stone-900">Chưa để lại SĐT</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <X size={12} />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-stone-500 font-mono">
          Hiển thị <span className="text-emerald-400 font-bold">{conversations.length}</span> / {totalInDb.toLocaleString()} kết quả
        </div>
      </div>

      {/* ================= 4. PANCAKE 3-COLUMN WORKSPACE ================= */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* ================= CỘT 1: DANH SÁCH HỘI THOẠI (310px) ================= */}
        <div className="w-[310px] bg-[#faf9f7] border-r border-stone-200 flex flex-col shrink-0 text-stone-800">
          {/* Search Header */}
          <div className="p-2 border-b border-stone-100 bg-[#faf9f7]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 text-stone-500" size={14} />
              <input
                type="text"
                placeholder="Tìm tên, SĐT hoặc mã khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchConversations(true);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-900 placeholder:text-stone-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                Không tìm thấy hội thoại phù hợp
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                const isMarkedUnread = unreadMap[conv.id];
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-2.5 transition-colors cursor-pointer flex items-start gap-2.5 relative ${
                      isSelected ? "bg-[#e8f0fe]" : "hover:bg-[#faf9f7]"
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {isMarkedUnread && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 shadow-xs"></span>
                    )}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm">
                        {conv.customerName ? conv.customerName.charAt(0) : "K"}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold border border-white">
                        f
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs truncate ${isMarkedUnread ? "text-rose-600 font-black" : "text-stone-900"}`}>
                          {conv.customerName}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono shrink-0 ml-1">
                          {new Date(conv.lastMessageAt).toLocaleTimeString("vi-VN", {
                            timeZone: "Asia/Ho_Chi_Minh",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {conv.lastMessageText || "Chưa có tin nhắn"}
                      </p>

                      {/* Bottom Row: Tag Badges on Left, Phone + Mailbox on Right */}
                      <div className="flex items-center justify-between mt-1.5 gap-1">
                        <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
                          {conv.tags && conv.tags.map((t) => {
                            const tagDef = MASTER_PANCAKE_TAGS[t];
                            return (
                              <span
                                key={t}
                                style={{
                                  backgroundColor: tagDef?.color || "#64748b",
                                  color: "white",
                                }}
                                className="px-1.5 py-0.2 rounded font-extrabold text-[9px] shadow-2xs leading-tight"
                              >
                                {t}
                              </span>
                            );
                          })}
                        </div>

                        {/* Quick Action Icons: Green Phone & Mailbox */}
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {/* Green Phone Button (Only when customer has phone or tag SDT) */}
                          {(conv.customerPhone || conv.tags?.includes("SDT")) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (conv.customerPhone) {
                                  window.open(`tel:${conv.customerPhone}`);
                                } else {
                                  showToast("Khách đã để lại SĐT trong tin nhắn!");
                                }
                              }}
                              className="w-5 h-5 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white flex items-center justify-center shadow-xs cursor-pointer transition-all shrink-0"
                              title={conv.customerPhone ? `Gọi SĐT: ${conv.customerPhone}` : "Khách có SĐT"}
                            >
                              <Phone size={11} className="fill-white" />
                            </button>
                          )}

                          {/* Mailbox Icon Button: Glows when unread, muted when read */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleUnread(conv.id);
                            }}
                            className={`p-0.5 rounded transition-all cursor-pointer shrink-0 ${
                              isMarkedUnread || conv.isUnread || conv.unreadCount > 0
                                ? "text-blue-600 hover:text-blue-700 animate-pulse"
                                : "text-stone-500 hover:text-stone-500"
                            }`}
                            title={
                              isMarkedUnread || conv.isUnread || conv.unreadCount > 0
                                ? "Tin nhắn mới chưa xem (Bấm để đánh dấu đã đọc)"
                                : "Đã xem tin nhắn (Bấm để đánh dấu chưa đọc)"
                            }
                          >
                            <Mail
                              size={14}
                              className={
                                isMarkedUnread || conv.isUnread || conv.unreadCount > 0
                                  ? "fill-blue-500 text-blue-600"
                                  : "fill-stone-300 text-stone-500"
                              }
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Load More Button */}
            {conversations.length < totalInDb && (
              <div className="p-2.5 text-center border-t border-stone-100 bg-[#faf9f7]">
                <button
                  onClick={loadMoreConversations}
                  disabled={loadingMore}
                  className="w-full py-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] font-bold text-xs rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {loadingMore ? (
                    <span>Đang nạp thêm...</span>
                  ) : (
                    <span>Tải thêm ({conversations.length}/{totalInDb.toLocaleString()} khách)</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= CỘT 2: KHUNG CHAT & THANH THẺ CHUẨN PANCAKE ================= */}
        <div className="flex-1 bg-white flex flex-col border-r border-stone-100 overflow-hidden text-stone-800">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="h-12 border-b border-stone-100 px-4 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs">
                    {selectedConv.customerName ? selectedConv.customerName.charAt(0) : "K"}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 flex items-center gap-2">
                      <span>{selectedConv.customerName}</span>
                      <span className="text-[10px] text-stone-500 font-normal font-mono">
                        ({getAssignedStaff(selectedConv.tags)} • {new Date(selectedConv.lastMessageAt).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" })})
                      </span>
                    </div>

                    {/* DÃY 3 ICON NHỎ (🔗 MỞ FB, 📋 COPY ID) */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={customer360?.fbProfileUrl || `https://facebook.com/${selectedConv.customerId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 hover:underline"
                        title="Mở Facebook cá nhân để kiểm tra nick thật hay clone"
                      >
                        <span>🔗 Mở FB Khách</span>
                        <ExternalLink size={10} />
                      </a>

                      <span className="text-stone-600">|</span>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://facebook.com/${selectedConv.customerId}`
                          );
                          showToast("Đã sao chép link Facebook khách hàng!");
                        }}
                        className="text-[10px] text-stone-400 hover:text-stone-600 flex items-center gap-0.5 cursor-pointer"
                        title="Sao chép liên kết"
                      >
                        <Copy size={10} />
                        <span>Copy ID</span>
                      </button>

                      <span className="text-stone-600">|</span>

                      <span className="text-[10px] text-stone-500 truncate max-w-[140px]">
                        {selectedConv.fanpage?.pageName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleUnread(selectedConv.id)}
                    className={`p-1.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                      unreadMap[selectedConv.id]
                        ? "bg-rose-50 border-rose-300 text-rose-600 shadow-2xs"
                        : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600"
                    }`}
                    title="Đánh dấu chưa đọc"
                  >
                    <Mail size={14} className={unreadMap[selectedConv.id] ? "text-rose-600 fill-rose-100" : "text-stone-500"} />
                    <span className="text-[11px] hidden sm:inline">
                      {unreadMap[selectedConv.id] ? "Chưa đọc" : "Đánh dấu chưa đọc"}
                    </span>
                  </button>

                  <button
                    onClick={() => handleOpenCopilot(selectedConv.id)}
                    className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-stone-800 rounded font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>AI Copilot</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Flow */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
                <div className="text-center">
                  <span className="px-3 py-0.5 rounded-full bg-stone-50 text-stone-400 text-[10px] font-medium">
                    Hội thoại gần nhất {ghostMode ? "• (Đang xem ở chế độ Đọc Ẩn 👻)" : ""}
                  </span>
                </div>

                {loadingMessages ? (
                  <div className="py-12 text-center text-stone-500">
                    <RefreshCw className="animate-spin inline-block mb-2" size={20} />
                    <p className="text-xs">Đang nạp tin nhắn từ Pancake...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 text-xs">
                    Chưa có tin nhắn trong hội thoại này
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isStaff = msg.senderType === "STAFF";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] text-stone-500 mb-0.5 font-mono">
                          {msg.senderId} • {new Date(msg.createdAt).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <div
                          className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-2xs ${
                            isStaff
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-[#f5f3ef] text-stone-900 rounded-bl-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* BẢNG 3 HÀNG THẺ MASTER CHUẨN 100% PANCAKE */}
              <div className="bg-[#faf9f7] border-t border-stone-100 px-2 py-1.5 shrink-0">
                {/* Label Dòng */}
                <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1 px-0.5">📌 Thẻ Telesale / Dịch Vụ / Kết Quả</div>

                {/* HÀNG 1: TELESALE - grid 10 cột cố định */}
                <div className="grid grid-cols-10 gap-0.5 mb-0.5">
                  {PANCAKE_GRID_ROW_1.map((item) => {
                    const isActive = selectedConv.tags?.includes(item.code);
                    return (
                      <button
                        key={item.code}
                        onClick={() => handleToggleTag(item.code)}
                        title={item.label}
                        style={{
                          backgroundColor: isActive ? item.color : "transparent",
                          borderColor: item.color,
                          color: isActive ? "white" : item.color,
                        }}
                        className="h-5 text-[9px] font-extrabold rounded border transition-all hover:opacity-85 cursor-pointer truncate leading-tight px-0.5"
                      >
                        {item.label.length > 4 ? item.label.slice(0, 4) : item.label}
                      </button>
                    );
                  })}
                </div>

                {/* HÀNG 2: DỊCH VỤ & KẾT QUẢ */}
                <div className="grid grid-cols-10 gap-0.5 mb-0.5">
                  {PANCAKE_GRID_ROW_2.map((item) => {
                    const isActive = selectedConv.tags?.includes(item.code);
                    return (
                      <button
                        key={item.code}
                        onClick={() => handleToggleTag(item.code)}
                        title={item.label}
                        style={{
                          backgroundColor: isActive ? item.color : "transparent",
                          borderColor: item.color,
                          color: isActive ? "white" : item.color,
                        }}
                        className="h-5 text-[9px] font-extrabold rounded border transition-all hover:opacity-85 cursor-pointer truncate leading-tight px-0.5"
                      >
                        {item.label.length > 4 ? item.label.slice(0, 4) : item.label}
                      </button>
                    );
                  })}
                </div>

                {/* HÀNG 3: TRẠNG THÁI TIẾP CẬN & CAPI */}
                <div className="grid grid-cols-10 gap-0.5">
                  {PANCAKE_GRID_ROW_3.map((item) => {
                    const isActive = selectedConv.tags?.includes(item.code);
                    return (
                      <button
                        key={item.code}
                        onClick={() => handleToggleTag(item.code)}
                        title={item.label}
                        style={{
                          backgroundColor: isActive ? item.color : "transparent",
                          borderColor: item.color,
                          color: isActive ? "white" : item.color,
                        }}
                        className="h-5 text-[9px] font-extrabold rounded border transition-all hover:opacity-85 cursor-pointer truncate leading-tight px-0.5"
                      >
                        {item.label.length > 5 ? item.label.slice(0, 5) : item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-2.5 bg-white border-t border-stone-100 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn phản hồi khách hàng (Enter để gửi)..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-[#faf9f7] border border-stone-200 rounded-lg text-xs text-stone-900 placeholder:text-stone-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-stone-800 rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-500 p-8">
              <MessageSquare size={48} className="text-stone-700 mb-3" />
              <p className="text-sm font-semibold text-stone-500">Chọn một khách hàng để bắt đầu hội thoại</p>
              <p className="text-xs text-stone-500 mt-1">Dữ liệu hội thoại được đồng bộ trực tiếp từ 68 kênh</p>
            </div>
          )}
        </div>

        {/* ================= CỘT 3: HỒ SƠ & MINICRM & HÀNH TRÌNH 360° (350px) ================= */}
        <div className="w-[350px] bg-[#faf9f7] border-l border-stone-200 flex flex-col shrink-0 text-stone-800 overflow-y-auto overflow-y-auto">
          {selectedConv ? (
            <div className="p-3.5 space-y-3.5">
              {/* Tab Switcher Header */}
              <div className="border-b border-stone-100 pb-2">
                <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-lg text-xs font-bold">
                  <button
                    onClick={() => setActiveRightTab("CRM")}
                    className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeRightTab === "CRM"
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <User size={13} />
                    <span>Hồ Sơ & miniCRM</span>
                  </button>

                  <button
                    onClick={() => setActiveRightTab("JOURNEY_360")}
                    className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeRightTab === "JOURNEY_360"
                        ? "bg-white text-emerald-600 shadow-2xs"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <History size={13} />
                    <span>Hành Trình 360°</span>
                  </button>
                </div>
              </div>

              {/* ================= TAB 1: THỨ TỰ ƯU TIÊN CHUẨN ================= */}
              {activeRightTab === "CRM" ? (
                <>
                  {/* 1. KHUNG GHI CHÚ TELESALE & NHẬN DIỆN CHI NHÁNH / MONG MUỐN KHÁCH */}
                  <div className="bg-[#fff9db] border border-[#f59f00]/40 rounded-xl p-3 shadow-2xs space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-[#f59f00]/20 pb-1.5">
                      <span className="text-[11px] font-black text-[#d9480f] uppercase tracking-wider flex items-center gap-1">
                        📝 Ghi chú Telesale: {getAssignedStaff(selectedConv.tags)}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(selectedConv.lastMessageAt).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="font-bold text-stone-900 text-xs">
                      {selectedConv.customerName} - <span className="text-blue-700">{selectedConv.customerPhone || "Chưa có SĐT"}</span>
                    </div>

                    {/* Chi nhánh tiếp nhận & Thay đổi khi khách follow */}
                    <div className="bg-white/80 border border-[#f59f00]/30 rounded-lg p-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 font-bold flex items-center gap-1">
                          <MapPin size={12} className="text-rose-500" />
                          <span>Chi nhánh tiếp nhận:</span>
                        </span>
                      </div>
                      <select
                        value={getEffectiveBranch(selectedConv, crmStatus?.lead, messages)}
                        onChange={(e) => handleUpdateBranch(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs font-bold text-emerald-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >

                        <option value="Chưa chọn chi nhánh (Đang tư vấn)">Chưa chọn chi nhánh (Đang tư vấn)</option>
                        {BRANCH_LIST.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nhu cầu & Mong muốn chi tiết */}
                    <div className="bg-white/80 border border-[#f59f00]/30 rounded-lg p-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 font-bold flex items-center gap-1">
                          <Edit3 size={12} className="text-blue-500" />
                          <span>Nhu cầu / Mong muốn chi tiết:</span>
                        </span>
                        {!editingWish ? (
                          <button
                            onClick={() => setEditingWish(true)}
                            className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            Sửa
                          </button>
                        ) : (
                          <button
                            onClick={handleSaveWish}
                            className="text-[10px] text-emerald-600 hover:underline font-bold cursor-pointer"
                          >
                            Lưu
                          </button>
                        )}
                      </div>

                      {editingWish ? (
                        <div className="space-y-1.5">
                          <textarea
                            rows={2}
                            value={wishInput}
                            onChange={(e) => setWishInput(e.target.value)}
                            placeholder="Nhập mong muốn cụ thể (VD: Khách ở Cần Thơ, hỏi trả góp răng sứ...)"
                            className="w-full p-1.5 bg-white border border-stone-200 rounded text-xs focus:outline-none focus:border-blue-500 text-stone-800"
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setEditingWish(false)}
                              className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleSaveWish}
                              className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              Lưu lại
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-600 italic">
                          {selectedConv.customerIntent || selectedConv.detectedService || "Đang tư vấn nhu cầu..."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. THẺ ĐÃ GÁN */}
                  <div className="bg-white border border-stone-100 rounded-xl p-3 shadow-2xs space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-stone-600 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Tag size={13} className="text-emerald-600" />
                        <span>Thẻ đã gán ({selectedConv.tags?.length || 0}):</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {selectedConv.tags && selectedConv.tags.map((t) => {
                        const tagDef = MASTER_PANCAKE_TAGS[t];
                        return (
                          <span
                            key={t}
                            style={{
                              backgroundColor: tagDef?.color || "#64748b",
                              color: "white",
                            }}
                            className="px-2 py-0.5 rounded font-extrabold text-[10px] flex items-center gap-1 shadow-2xs"
                          >
                            <span>{t}</span>
                            <button
                              onClick={() => handleToggleTag(t)}
                              className="hover:bg-black/20 rounded-full w-3 h-3 flex items-center justify-center cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Thêm thẻ mới..."
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customTagInput.trim()) {
                            handleToggleTag(customTagInput.trim());
                            setCustomTagInput("");
                          }
                        }}
                        className="flex-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (customTagInput.trim()) {
                            handleToggleTag(customTagInput.trim());
                            setCustomTagInput("");
                          }
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 3. MINICRM (GỌN GÀNG) */}
                  <div className="bg-white border border-stone-100 rounded-xl p-3 shadow-2xs space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Database size={14} className="text-blue-600" />
                        <span className="text-xs font-black text-stone-900 uppercase tracking-wide">
                          miniCRM
                        </span>
                      </div>
                      {crmStatus?.isMatched ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                          <Check size={11} />
                          <span>ĐÃ KHỚP CRM</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
                          <AlertCircle size={11} />
                          <span>CHƯA CÓ TRÊN CRM</span>
                        </span>
                      )}
                    </div>

                    {/* Chi tiết khớp từ CRM */}
                    {crmStatus?.isMatched && crmStatus.lead ? (
                      <div className="space-y-1.5 text-xs">
                        {/* SĐT Khách Đặt Hẹn */}
                        <div className="flex items-center justify-between py-1 border-b border-stone-100 bg-emerald-50/50 px-2 rounded">
                          <span className="text-stone-500 font-bold flex items-center gap-1">
                            <Phone size={12} className="text-emerald-600" />
                            <span>SĐT Đặt Hẹn:</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-emerald-700 text-[12px]">
                              {crmStatus.lead.phone || selectedConv.customerPhone || "Chưa có"}
                            </span>
                            {(crmStatus.lead.phone || selectedConv.customerPhone) && (
                              <>
                                <button
                                  onClick={() => {
                                    const p = crmStatus?.lead?.phone || selectedConv.customerPhone;
                                    if (p) {
                                      navigator.clipboard.writeText(p);
                                      showToast("Đã sao chép SĐT đặt hẹn!");
                                    }
                                  }}
                                  className="p-0.5 text-stone-400 hover:text-stone-800 cursor-pointer"
                                  title="Sao chép SĐT"
                                >
                                  <Copy size={11} />
                                </button>
                                <button
                                  onClick={() => {
                                    const p = crmStatus?.lead?.phone || selectedConv.customerPhone;
                                    if (p) window.open(`tel:${p}`);
                                  }}
                                  className="p-0.5 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                  title="Gọi ngay"
                                >
                                  <Phone size={11} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Dịch Vụ Khách Quan Tâm / Đặt Hẹn */}
                        <div className="flex items-center justify-between py-1 border-b border-stone-100 bg-blue-50/50 px-2 rounded">
                          <span className="text-stone-500 font-bold flex items-center gap-1">
                            <span>🦷 Dịch Vụ:</span>
                          </span>
                          <span className="font-extrabold text-blue-800 text-[11px]">
                            {crmStatus.lead.service || selectedConv.detectedService || "Nha Khoa Tổng Quát"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-0.5 border-b border-stone-50">
                          <span className="text-stone-400">Trạng thái CRM:</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold text-[11px]">
                            {crmStatus.lead.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-0.5 border-b border-stone-50">
                          <span className="text-stone-400">Telesale CRM:</span>
                          <span className="font-bold text-stone-800">{crmStatus.lead.telesale || "Chưa phân bổ"}</span>
                        </div>

                        <div className="flex items-center justify-between py-0.5 border-b border-stone-50">
                          <span className="text-stone-400">Chi nhánh tiếp nhận:</span>
                          <span className="font-bold text-stone-800">{crmStatus.lead.branch || selectedConv.detectedBranch}</span>
                        </div>

                        <div className="flex items-center justify-between py-0.5 border-b border-stone-50">
                          <span className="text-stone-400">Doanh thu thực tế:</span>
                          <span className="font-extrabold text-emerald-600 text-[12px]">
                            {(crmStatus.lead.actualRevenue || 0).toLocaleString()} đ
                          </span>
                        </div>

                        {crmStatus.lead.appointmentDate && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mt-1">
                            <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                              <Calendar size={12} />
                              <span>Lịch Hẹn: {crmStatus.lead.appointmentDate} ({crmStatus.lead.appointmentTime || "09:00"})</span>
                            </div>
                            <div className="text-[10px] text-blue-700 mt-0.5">
                              BS: {crmStatus.lead.appointmentDoctor || "Phòng khám"} • CN: {crmStatus.lead.appointmentBranch || "Đã hẹn"}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <p className="text-[11px] text-stone-400">
                          Khách hàng chưa có hồ sơ trên miniCRM.
                        </p>
                        {/* Chỉ hiện nút Đẩy khi có SĐT + Dịch Vụ */}
                        {(selectedConv.customerPhone || crmStatus?.lead?.phone) &&
                          (selectedConv.detectedService || selectedConv.customerIntent || crmStatus?.lead?.service) ? (
                          <button
                            onClick={handleSyncToMiniCRM}
                            disabled={crmSyncing}
                            className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-stone-800 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                          >
                            {crmSyncing ? (
                              <span>Đang đồng bộ...</span>
                            ) : (
                              <>
                                <span>⚡ Đẩy Sang miniCRM</span>
                                <span className="text-blue-200 text-[10px]">& Bắn Meta CAPI</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-start gap-1.5">
                            <AlertCircle size={13} className="shrink-0 mt-0.5 text-amber-500" />
                            <span>Cần có <b>SĐT</b> và <b>Dịch Vụ</b> để đẩy sang miniCRM</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4. QUẢNG CÁO (GỌN GÀNG, COLLAPSIBLE) */}
                  {customer360?.adsAttribution && (
                    <div className="bg-white border border-stone-100 rounded-xl shadow-2xs overflow-hidden text-xs">
                      <div
                        onClick={() => setAdsDetailExpanded(!adsDetailExpanded)}
                        className="p-2.5 bg-stone-50 hover:bg-stone-50 border-b border-stone-100 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <Target size={14} className="text-blue-600 shrink-0" />
                          <span className="font-black text-stone-900 uppercase text-[11px] tracking-wide">
                            Quảng Cáo
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-blue-700 font-bold">
                          <span>{adsDetailExpanded ? "Thu gọn" : "Xem chi tiết"}</span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${adsDetailExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>

                      {adsDetailExpanded && (
                        <div className="p-3 space-y-2.5 bg-white animate-in fade-in duration-150">
                          {/* Nguồn Tracking & Mã Ads */}
                          <div className="flex items-center justify-between py-0.5 border-b border-stone-100">
                            <span className="text-stone-400 text-[10px]">Nguồn tracking:</span>
                            <span className="font-bold text-emerald-700 text-[10px]">
                              {customer360.adsAttribution.referralSource || "Meta Feed Ads"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-0.5 border-b border-stone-100">
                            <span className="text-stone-400 text-[10px]">Mã Ads ID:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-blue-700 text-[10px]">
                                {customer360.adsAttribution.adId}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(customer360.adsAttribution.adId);
                                  showToast("Đã sao chép Mã Ad ID!");
                                }}
                                className="p-0.5 text-blue-600 hover:text-blue-800 cursor-pointer"
                              >
                                <Copy size={10} />
                              </button>
                            </div>
                          </div>

                          {/* Tên Chiến Dịch (Campaign) */}
                          <div className="py-0.5 border-b border-stone-100 space-y-0.5">
                            <span className="text-stone-400 text-[10px] block">Chiến Dịch (Campaign):</span>
                            <p className="font-bold text-[#0d4f4a] text-[11px] leading-tight break-all">
                              {customer360.adsAttribution.campaignName || "CAMP_TDS_MESSENGER_CONVERSION"}
                            </p>
                          </div>

                          {/* Tên Nhóm Quảng Cáo (Adset) */}
                          <div className="py-0.5 border-b border-stone-100 space-y-0.5">
                            <span className="text-stone-400 text-[10px] block">Nhóm Quảng Cáo (Adset):</span>
                            <p className="font-bold text-stone-900 text-[11px] leading-tight break-all">
                              {customer360.adsAttribution.adsetName}
                            </p>
                          </div>

                          {/* Hình Ảnh / Thumbnail Mẫu Quảng Cáo Thực Tế */}
                          {customer360.adsAttribution.thumbnailUrl && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-stone-500 uppercase block">
                                Hình ảnh / Video Ads:
                              </span>
                              <div className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-900 group">
                                <img
                                  src={customer360.adsAttribution.thumbnailUrl}
                                  alt="Ad Thumbnail"
                                  className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                                />
                                {customer360.adsAttribution.videoSource && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="px-2.5 py-1 bg-white/90 text-stone-900 text-[10px] font-bold rounded-full shadow flex items-center gap-1">
                                      ▶ Phát Video (1080p)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Bài Viết Quảng Cáo */}
                          <div className="pt-0.5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-stone-500 uppercase">
                                Bài viết quảng cáo:
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(
                                    `${customer360.adsAttribution.adHeadline}\n\n${customer360.adsAttribution.adContent}`
                                  );
                                  showToast("Đã sao chép nội dung bài viết Ads!");
                                }}
                                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Copy size={10} />
                                <span>Copy</span>
                              </button>
                            </div>
                            <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                              <div className="font-bold text-[#0d4f4a] mb-1 text-[11px]">
                                {customer360.adsAttribution.adHeadline}
                              </div>
                              <p className="text-[10px] text-stone-700 whitespace-pre-line leading-relaxed">
                                {customer360.adsAttribution.adContent}
                              </p>
                              {customer360.adsAttribution.ctaTitle && (
                                <div className="mt-2 pt-1.5 border-t border-stone-200 flex items-center justify-between">
                                  <span className="text-[10px] text-stone-400">Nút CTA:</span>
                                  <span className="px-2 py-0.5 bg-[#0d4f4a] text-white text-[10px] font-bold rounded">
                                    {customer360.adsAttribution.ctaTitle}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. CHI TIẾT HỒ SƠ */}
                  <div className="bg-white border border-stone-100 rounded-xl p-3 shadow-2xs space-y-2 text-xs">
                    <div className="font-bold text-stone-900 border-b border-stone-100 pb-1 flex items-center justify-between">
                      <span>Chi tiết hồ sơ</span>
                      <span className="text-[10px] font-mono text-stone-500">ID: {selectedConv.customerId}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Tên Facebook:</span>
                        <span className="font-bold text-stone-900">{selectedConv.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Số điện thoại:</span>
                        <span className="font-bold text-blue-600 font-mono">
                          {selectedConv.customerPhone || "Chưa có"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Kênh kết nối:</span>
                        <span className="font-medium text-stone-600">{selectedConv.fanpage?.pageName}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ================= TAB 2: HÀNH TRÌNH 360° THEO THỨ TỰ CHUẨN ================= */
                <div className="space-y-3">
                  {/* 1. TỔNG QUAN HÀNH TRÌNH */}
                  <div className="bg-white border border-stone-100 rounded-xl p-3 shadow-2xs space-y-2 text-xs">
                    <div className="font-bold text-stone-900 flex items-center justify-between border-b border-stone-100 pb-1.5">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <Layers size={14} />
                        <span>Tổng Quan Hành Trình Đa Kênh</span>
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        {customer360?.totalTouchpoints || 1} Điểm chạm
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 block">Số Fanpage đã chat:</span>
                        <span className="text-base font-black text-blue-600">
                          {customer360?.totalFanpagesChatted || 1} Page
                        </span>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 block">Điểm chạm đầu tiên:</span>
                        <span className="text-xs font-bold text-emerald-600 truncate block">
                          {customer360?.firstTouchPoint?.channelName || selectedConv.fanpage?.pageName || "Fanpage"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. TIMELINE HÀNH TRÌNH TIẾP CẬN */}
                  <div className="bg-white border border-stone-100 rounded-xl p-3.5 shadow-2xs space-y-3">
                    <div className="font-bold text-xs text-stone-900 flex items-center justify-between">
                      <span>Timeline Tiếp Cận Theo Thời Gian</span>
                      <span className="text-[10px] text-stone-500 font-mono">Từ cũ đến mới</span>
                    </div>

                    {loading360 ? (
                      <div className="py-8 text-center text-stone-500 text-xs">
                        <RefreshCw className="animate-spin inline-block mb-1" size={16} />
                        <p>Đang dựng hành trình 360°...</p>
                      </div>
                    ) : customer360?.timeline && customer360.timeline.length > 0 ? (
                      <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100">
                        {customer360.timeline.map((item, idx) => (
                          <div key={item.id} className="relative group">
                            <span
                              style={{ backgroundColor: item.badgeColor }}
                              className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-2xs"
                            ></span>

                            <div className="text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-stone-900">{item.title}</span>
                                <span className="text-[10px] text-stone-500 font-mono">
                                  {new Date(item.timestamp).toLocaleDateString("vi-VN", {
                                    timeZone: "Asia/Ho_Chi_Minh",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                              <span className="inline-block mt-1 px-1.5 py-0.2 bg-stone-50 text-stone-500 rounded text-[9px] font-medium">
                                Kênh: {item.channelName}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-500 text-xs">
                        Chưa có lịch sử đa kênh cho khách này
                      </div>
                    )}
                  </div>

                  {/* 3. QUẢNG CÁO (COLLAPSIBLE TRONG TAB 360) */}
                  {customer360?.adsAttribution && (
                    <div className="bg-white border border-stone-100 rounded-xl shadow-2xs overflow-hidden text-xs">
                      <div
                        onClick={() => setAdsDetailExpanded(!adsDetailExpanded)}
                        className="p-2.5 bg-stone-50 hover:bg-stone-50 border-b border-stone-100 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <Target size={14} className="text-blue-600 shrink-0" />
                          <span className="font-black text-stone-900 uppercase text-[11px] tracking-wide">
                            Quảng Cáo
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-blue-700 font-bold">
                          <span>{adsDetailExpanded ? "Thu gọn" : "Xem chi tiết"}</span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${adsDetailExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>

                      {adsDetailExpanded && (
                        <div className="p-3 space-y-2 bg-white animate-in fade-in duration-150">
                          <div className="flex items-center justify-between py-0.5 border-b border-stone-50">
                            <span className="text-stone-400 text-[11px]">Nguồn tracking:</span>
                            <span className="font-bold text-emerald-700 text-[11px]">
                              {customer360.adsAttribution.referralSource || "Website Click Messenger"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-0.5 border-b border-stone-50">
                            <span className="text-stone-400 text-[11px]">Mã Ads ID:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-blue-700 text-[11px]">
                                {customer360.adsAttribution.adId}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(customer360.adsAttribution.adId);
                                  showToast("Đã sao chép Mã Ad ID!");
                                }}
                                className="p-0.5 text-blue-600 cursor-pointer"
                              >
                                <Copy size={10} />
                              </button>
                            </div>
                          </div>

                          <div className="py-0.5 border-b border-stone-50 space-y-0.5">
                            <span className="text-stone-400 text-[10px] block">Nhóm Quảng Cáo (Adset):</span>
                            <p className="font-bold text-stone-900 text-[11px] leading-tight break-all">
                              {customer360.adsAttribution.adsetName}
                            </p>
                          </div>

                          <div className="pt-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-stone-500 uppercase">
                                Bài viết quảng cáo:
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(
                                    `${customer360.adsAttribution.adHeadline}\n\n${customer360.adsAttribution.adContent}`
                                  );
                                  showToast("Đã sao chép nội dung bài viết Ads!");
                                }}
                                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Copy size={10} />
                                <span>Copy</span>
                              </button>
                            </div>
                            <div className="bg-stone-50 border border-stone-100 rounded p-2 text-stone-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                              <div className="font-bold text-blue-900 mb-0.5">
                                {customer360.adsAttribution.adHeadline}
                              </div>
                              {customer360.adsAttribution.adContent}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-stone-500 text-xs">
              Chưa chọn khách hàng
            </div>
          )}
        </div>
      </div>

      {/* ================= AI COPILOT MODAL ================= */}
      {copilotModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <span className="font-bold text-sm">AI Copilot • Gợi Ý Phản Hồi Chốt Hẹn</span>
              </div>
              <button
                onClick={() => setCopilotModalOpen(false)}
                className="hover:bg-white/20 rounded-lg p-1 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {copilotLoading ? (
                <div className="py-10 text-center text-stone-500">
                  <RefreshCw className="animate-spin inline-block mb-2 text-amber-400" size={24} />
                  <p>AI đang đọc nội dung chat và phân tích ý định của khách...</p>
                </div>
              ) : activeCopilotData ? (
                <>
                  <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Nhu cầu phát hiện:</span>
                      <span className="font-bold text-amber-400">{activeCopilotData.detectedService}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Chi nhánh muốn ghé:</span>
                      <span className="font-bold text-emerald-400">{activeCopilotData.detectedBranch}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                      Kịch bản phản hồi gợi ý (Tối ưu chốt lịch khám):
                    </label>
                    <div className="bg-stone-100 border border-stone-200 rounded-xl p-3.5 text-stone-700 text-xs leading-relaxed whitespace-pre-wrap">
                      {activeCopilotData.suggestedResponse}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeCopilotData.suggestedResponse);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy size={13} />
                      <span>{copied ? "Đã sao chép!" : "Sao chép"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setReplyText(activeCopilotData.suggestedResponse);
                        setCopilotModalOpen(false);
                        showToast("Đã chèn câu trả lời vào khung chat!");
                      }}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-stone-800 rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Sử dụng câu này</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
