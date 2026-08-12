"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check, X } from "lucide-react";

export type DatePresetKey =
  | "MONTH_4"
  | "MONTH_5"
  | "MONTH_6"
  | "MONTH_7"
  | "MONTH_8"
  | "MONTH_9"
  | "MONTH_10"
  | "MONTH_11"
  | "MONTH_12"
  | "TODAY"
  | "YESTERDAY"
  | "TODAY_YESTERDAY"
  | "LAST_7_DAYS"
  | "LAST_14_DAYS"
  | "LAST_28_DAYS"
  | "LAST_30_DAYS"
  | "THIS_WEEK"
  | "LAST_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
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

  const handleApply = () => {
    onChangePreset(tempPreset, startDate, endDate);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
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
        <div className="absolute right-0 mt-2 w-[420px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden font-sans text-xs animate-in fade-in zoom-in-95 duration-150 p-4">

            {/* Right Main Area: Interactive Dual Month Calendar Grid */}
            <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
              {/* Dual Month Header */}
              <div className="grid grid-cols-2 gap-4 text-center font-bold text-stone-900 border-b pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 cursor-pointer hover:text-stone-900">‹</span>
                  <span>Tháng 8 2026</span>
                  <span className="text-stone-400"></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400"></span>
                  <span>Tháng 9 2026</span>
                  <span className="text-stone-400 cursor-pointer hover:text-stone-900">›</span>
                </div>
              </div>

              {/* Calendar Grid Demo View */}
              <div className="grid grid-cols-2 gap-6 text-[11px]">
                {/* Month 1: Tháng 8 */}
                <div className="space-y-2">
                  <div className="grid grid-cols-7 text-center font-mono font-bold text-stone-400">
                    <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
                  </div>
                  <div className="grid grid-cols-7 text-center font-mono gap-y-1">
                    <span className="text-stone-300"></span><span className="text-stone-300"></span><span className="text-stone-300"></span><span className="text-stone-300"></span><span className="text-stone-300"></span><span className="text-stone-300"></span><span>1</span>
                    <span>2</span><span>3</span><span className="bg-[#0284c7] text-white font-bold rounded-full w-6 h-6 leading-6 mx-auto">4</span><span>5</span><span>6</span><span>7</span><span>8</span>
                    <span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
                    <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span>
                    <span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span>
                    <span>30</span><span>31</span>
                  </div>
                </div>

                {/* Month 2: Tháng 9 */}
                <div className="space-y-2">
                  <div className="grid grid-cols-7 text-center font-mono font-bold text-stone-400">
                    <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
                  </div>
                  <div className="grid grid-cols-7 text-center font-mono gap-y-1">
                    <span className="text-stone-300"></span><span className="text-stone-300"></span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                    <span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span>
                    <span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span>
                    <span>27</span><span>28</span><span>29</span><span>30</span>
                  </div>
                </div>
              </div>

              {/* Compare Checkbox & Date Input Fields */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-medium">
                  <input
                    type="checkbox"
                    checked={enableCompare}
                    onChange={(e) => setEnableCompare(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#0284c7] focus:ring-[#0284c7]"
                  />
                  <span>So sánh với kỳ trước</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                  <span className="text-stone-400">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Timezone Note & Bottom Action Buttons */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-stone-200 text-stone-500 text-[11px]">
                <span>Ngày hiển thị theo Giờ TP Hồ Chí Minh (GMT+7)</span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-5 py-2 bg-[#0284c7] text-white rounded-xl font-bold hover:bg-[#0369a1] transition-colors shadow-xs cursor-pointer"
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
