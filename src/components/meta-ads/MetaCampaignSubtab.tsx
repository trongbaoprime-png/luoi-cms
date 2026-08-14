"use client";

import { useState, useMemo } from "react";
import { Search, AlertTriangle, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { MetaCampaignRow } from "@/app/admin/meta-ads/page";

interface MetaCampaignSubtabProps {
  campaigns: MetaCampaignRow[];
}

export default function MetaCampaignSubtab({ campaigns }: MetaCampaignSubtabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter campaigns
  const filtered = useMemo(() => {
    return campaigns.filter((row) => {
      if (statusFilter && row.effective_status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const name = (row.campaign_name || "").toLowerCase();
        const adset = (row.adset_name || "").toLowerCase();
        const service = (row.service || "").toLowerCase();
        const branch = (row.branch || "").toLowerCase();
        if (!name.includes(term) && !adset.includes(term) && !service.includes(term) && !branch.includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [campaigns, statusFilter, searchTerm]);

  // Totals for filtered campaigns
  const totals = useMemo(() => {
    let spend = 0;
    let messages = 0;
    let leads = 0;
    let reach = 0;
    let impressions = 0;

    filtered.forEach((r) => {
      spend += r.spend || 0;
      messages += r.messagesNew || 0;
      leads += r.leads || 0;
      reach += r.reach || 0;
      impressions += r.impressions || 0;
    });

    const cptn = messages > 0 ? spend / messages : 0;
    const cpl = leads > 0 ? spend / leads : 0;

    return { spend, messages, leads, reach, impressions, cptn, cpl };
  }, [filtered]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4 font-mono">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-stone-900 font-sans">
            Danh Sách Chiến Dịch &amp; Nhóm Quảng Cáo Meta ({filtered.length})
          </h3>
          <p className="text-[11px] text-stone-500">
            Chi tiết hiệu suất chi tiêu, tin nhắn mới, CPL, chỉ số phân phối CPM/CTR &amp; Cảnh báo lãng phí.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo tên camp / nhóm / chi nhánh..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 border border-stone-200 rounded-xl text-xs bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a] w-56"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-stone-200 rounded-xl text-xs bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">ACTIVE (Đang chạy)</option>
            <option value="PAUSED">PAUSED (Tắt)</option>
            <option value="DELETED">DELETED (Đã xóa)</option>
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 border border-stone-200 rounded-xl text-xs bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
          >
            <option value={10}>10 dòng/trang</option>
            <option value={20}>20 dòng/trang</option>
            <option value={50}>50 dòng/trang</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100/80 text-stone-700 font-bold">
              <th className="p-3">Campaign / Adset</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Dịch vụ</th>
              <th className="p-3">Khu vực</th>
              <th className="p-3 text-right">Chi tiêu</th>
              <th className="p-3 text-right">TN mới</th>
              <th className="p-3 text-right">CP / TN</th>
              <th className="p-3 text-right">KHTN (Lead)</th>
              <th className="p-3 text-right">CPL</th>
              <th className="p-3 text-right">Reach</th>
              <th className="p-3 text-right">CPM</th>
              <th className="p-3 text-right">CTR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-8 text-center text-stone-400">
                  Không tìm thấy Campaign / Adset nào khớp bộ lọc.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const spend = row.spend || 0;
                const messages = row.messagesNew || 0;
                const cptn = messages > 0 ? spend / messages : 0;
                
                // Highlight logic: Spend > 500k & 0 message OR CPTN > 150k
                const isZeroMessages = spend > 500000 && messages === 0;
                const isHighCost = messages > 0 && cptn > 150000;
                const isDanger = isZeroMessages || isHighCost;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-stone-50 transition-colors ${
                      isDanger ? "bg-rose-50/80 text-rose-950 font-medium" : ""
                    }`}
                  >
                    <td className="p-3 max-w-[260px]">
                      <div className="flex items-start gap-1.5">
                        {isZeroMessages && (
                          <span title="Cảnh báo: Chi tiêu > 500k nhưng 0 Tin nhắn!" className="mt-0.5 shrink-0 text-rose-600">
                            <AlertTriangle size={14} />
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-stone-900 truncate">{row.campaign_name || "Campaign không tên"}</p>
                          <small className="text-stone-500 block truncate">{row.adset_name || "Nhóm tổng"}</small>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          row.effective_status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {row.effective_status || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="p-3">{row.service || "Khác"}</td>
                    <td className="p-3">{row.branch || "HCM"}</td>
                    <td className="p-3 text-right font-bold text-stone-900">{spend.toLocaleString("vi-VN")} ₫</td>
                    <td className="p-3 text-right font-bold text-[#0d4f4a]">{messages}</td>
                    <td className="p-3 text-right font-bold">
                      {messages > 0 ? (
                        <span className={cptn > 120000 ? "text-rose-700" : "text-stone-800"}>
                          {Math.round(cptn).toLocaleString("vi-VN")} ₫
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold text-[11px]">0 TN (Cảnh báo)</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700">{row.leads || 0}</td>
                    <td className="p-3 text-right">
                      {row.leads ? Math.round(spend / row.leads).toLocaleString("vi-VN") + " ₫" : "—"}
                    </td>
                    <td className="p-3 text-right text-stone-600">{(row.reach || 0).toLocaleString("vi-VN")}</td>
                    <td className="p-3 text-right text-stone-600">{Math.round(row.cpm || 0).toLocaleString("vi-VN")} ₫</td>
                    <td className="p-3 text-right text-stone-600">{(row.ctr || 0).toFixed(2)}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Summary Row */}
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-stone-100 border-t-2 border-stone-300 font-bold text-stone-900">
                <td colSpan={4} className="p-3 text-right">TỔNG CỘNG ({filtered.length} Camp):</td>
                <td className="p-3 text-right font-bold text-[#0d4f4a]">{totals.spend.toLocaleString("vi-VN")} ₫</td>
                <td className="p-3 text-right font-bold text-[#0d4f4a]">{totals.messages.toLocaleString("vi-VN")}</td>
                <td className="p-3 text-right font-bold">{Math.round(totals.cptn).toLocaleString("vi-VN")} ₫</td>
                <td className="p-3 text-right font-bold text-emerald-700">{totals.leads.toLocaleString("vi-VN")}</td>
                <td className="p-3 text-right font-bold">{Math.round(totals.cpl).toLocaleString("vi-VN")} ₫</td>
                <td className="p-3 text-right text-stone-700">{totals.reach.toLocaleString("vi-VN")}</td>
                <td colSpan={2} className="p-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-stone-500">
          <span>
            Trang <strong>{currentPage}</strong> / {totalPages} (Tổng {filtered.length} dòng)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                    currentPage === pageNum ? "bg-[#0d4f4a] text-white" : "border border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
