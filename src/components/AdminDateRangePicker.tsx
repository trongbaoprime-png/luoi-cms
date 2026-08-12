"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown, Clock } from "lucide-react";

export type DatePresetKey =
  | "TODAY"
  | "YESTERDAY"
  | "TODAY_YESTERDAY"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_WEEK"
  | "LAST_WEEK"
  | "LAST_7_DAYS"
  | "LAST_14_DAYS"
  | "LAST_28_DAYS"
  | "LAST_30_DAYS"
  | "ALL_TIME";

export interface DatePresetOption {
  key: DatePresetKey;
  label: string;
}

export const DATE_PRESETS: DatePresetOption[] = [
  { key: "TODAY", label: "Hôm nay" },
  { key: "YESTERDAY", label: "Hôm qua" },
  { key: "TODAY_YESTERDAY", label: "Hôm nay và hôm qua" },
  { key: "THIS_MONTH", label: "Tháng này" },
  { key: "LAST_MONTH", label: "Tháng trước" },
  { key: "THIS_WEEK", label: "Tuần này" },
  { key: "LAST_WEEK", label: "Tuần trước" },
  { key: "LAST_7_DAYS", label: "7 ngày qua" },
  { key: "LAST_14_DAYS", label: "14 ngày qua" },
  { key: "LAST_28_DAYS", label: "28 ngày qua" },
  { key: "LAST_30_DAYS", label: "30 ngày qua" },
  { key: "ALL_TIME", label: "Tất cả thời gian" },
];

export function getPresetDates(preset: DatePresetKey): { from: string; to: string } {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const getDaysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
  };

  switch (preset) {
    case "TODAY":
      return { from: todayStr, to: todayStr };
    case "YESTERDAY": {
      const y = getDaysAgo(1);
      return { from: y, to: y };
    }
    case "TODAY_YESTERDAY":
      return { from: getDaysAgo(1), to: todayStr };
    case "LAST_7_DAYS":
      return { from: getDaysAgo(6), to: todayStr };
    case "LAST_14_DAYS":
      return { from: getDaysAgo(13), to: todayStr };
    case "LAST_28_DAYS":
      return { from: getDaysAgo(27), to: todayStr };
    case "LAST_30_DAYS":
      return { from: getDaysAgo(29), to: todayStr };
    case "THIS_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      return { from: start, to: todayStr };
    }
    case "LAST_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
      return { from: start, to: end };
    }
    case "THIS_WEEK": {
      const day = now.getDay() || 7;
      const start = getDaysAgo(day - 1);
      return { from: start, to: todayStr };
    }
    case "LAST_WEEK": {
      const day = now.getDay() || 7;
      const end = getDaysAgo(day);
      const start = getDaysAgo(day + 6);
      return { from: start, to: end };
    }
    case "ALL_TIME":
    default:
      return { from: "2024-01-01", to: todayStr };
  }
}

interface AdminDateRangePickerProps {
  selectedPreset: DatePresetKey;
  onChangePreset: (preset: DatePresetKey, customFrom?: string, customTo?: string) => void;
}

export default function AdminDateRangePicker({
  selectedPreset,
  onChangePreset,
}: AdminDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPreset, setTempPreset] = useState<DatePresetKey>(selectedPreset);
  const initialDates = getPresetDates(selectedPreset);
  const [startDate, setStartDate] = useState(initialDates.from);
  const [endDate, setEndDate] = useState(initialDates.to);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync state if prop changes
  useEffect(() => {
    setTempPreset(selectedPreset);
    const d = getPresetDates(selectedPreset);
    setStartDate(d.from);
    setEndDate(d.to);
  }, [selectedPreset]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = DATE_PRESETS.find((p) => p.key === selectedPreset) || DATE_PRESETS[0];

  const handleSelectPreset = (key: DatePresetKey) => {
    setTempPreset(key);
    const dates = getPresetDates(key);
    setStartDate(dates.from);
    setEndDate(dates.to);
  };

  const handleClearFilter = () => {
    handleSelectPreset("ALL_TIME");
  };

  const handleApply = () => {
    onChangePreset(tempPreset, startDate, endDate);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left font-sans" ref={popoverRef}>
      {/* Header Trigger Button matching reference image */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-stone-900 border border-stone-300 rounded-xl text-xs font-bold hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
      >
        <CalendarIcon size={15} className="text-[#0d9488]" />
        <span>
          {activeOption.label} {startDate ? `(${startDate === endDate ? startDate : `${startDate} đến ${endDate}`})` : ""}
        </span>
        <ChevronDown size={14} className="text-stone-500" />
      </button>

      {/* Popover Date Range Picker Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[620px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden font-sans text-xs animate-in fade-in zoom-in-95 duration-150 flex">
          {/* Left Sidebar: Radio Options List */}
          <div className="w-[210px] border-r border-stone-200 p-4 space-y-1.5 bg-stone-50/60 max-h-[460px] overflow-y-auto shrink-0 select-none">
            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3">
              LỌC NHANH THỜI GIAN
            </h4>
            <div className="space-y-1">
              {DATE_PRESETS.map((option) => {
                const isSelected = tempPreset === option.key;
                return (
                  <label
                    key={option.key}
                    onClick={() => handleSelectPreset(option.key)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#0d4f4a]/10 text-[#0d4f4a] font-bold"
                        : "text-stone-700 hover:bg-stone-100 font-medium"
                    }`}
                  >
                    <input
                      type="radio"
                      name="datePreset"
                      checked={isSelected}
                      onChange={() => handleSelectPreset(option.key)}
                      className="w-4 h-4 text-[#0d4f4a] border-stone-300 focus:ring-[#0d4f4a]"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Right Area: Interactive Custom Date Range Selection */}
          <div className="flex-1 p-6 space-y-6 flex flex-col justify-between bg-white">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Khoảng Thời Gian Lọc Dữ Liệu</h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Tất cả KPI, tỷ lệ Đậu/Rớt và danh sách Khách hàng sẽ được tính toán lại theo khoảng thời gian này.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Từ Ngày</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0d4f4a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Đến Ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0d4f4a]"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                  <Clock size={14} className="text-stone-400" />
                  <span>Giờ Việt Nam (GMT+7)</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="font-bold text-stone-700 hover:text-stone-900 underline cursor-pointer"
                >
                  Bỏ lọc (Tất cả)
                </button>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 bg-[#042d2a] hover:bg-[#021c1a] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
              >
                Áp Dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
