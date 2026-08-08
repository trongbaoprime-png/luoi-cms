"use client";

import { useState, useEffect } from "react";
import { COUNTRY_CODES, CountryCodeInfo } from "@/lib/country-codes";
import { Globe } from "lucide-react";

interface SmartPhoneInputProps {
  value: string;
  onChange: (fullValue: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputStyleClass?: string;
}

let cachedGeoResult: { isVietnam: boolean; countryCode: string } | null = null;

export default function SmartPhoneInput({
  value,
  onChange,
  required = true,
  placeholder,
  className = "",
  inputStyleClass = "",
}: SmartPhoneInputProps) {
  // Mode: "VN" (Standard Vietnam mode with 0...) vs "INT" (International mode with Flag dropdown)
  const [mode, setMode] = useState<"VN" | "INT">("VN");
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeInfo>(
    COUNTRY_CODES.find((c) => c.code === "US") || COUNTRY_CODES[1]
  );
  const [localNumber, setLocalNumber] = useState("");
  const [detectedGeo, setDetectedGeo] = useState<string>("VN");
  const [geoLoaded, setGeoLoaded] = useState(false);

  useEffect(() => {
    if (cachedGeoResult) {
      applyGeo(cachedGeoResult);
      setGeoLoaded(true);
      return;
    }

    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.countryCode) {
          const result = {
            isVietnam: data.isVietnam !== false,
            countryCode: data.countryCode,
          };
          cachedGeoResult = result;
          applyGeo(result);
        }
      })
      .catch(() => {})
      .finally(() => setGeoLoaded(true));
  }, []);

  const applyGeo = (geo: { isVietnam: boolean; countryCode: string }) => {
    setDetectedGeo(geo.countryCode);
    if (!geo.isVietnam) {
      // OVERSEAS IP DETECTED -> Switch to International Mode automatically!
      setMode("INT");
      const matched = COUNTRY_CODES.find((c) => c.code === geo.countryCode);
      if (matched) {
        setSelectedCountry(matched);
      }
    } else {
      // VIETNAM IP -> Stay in Standard Vietnam Mode
      setMode("VN");
    }
  };

  // Sync external value to local state
  useEffect(() => {
    if (mode === "VN") {
      setLocalNumber(value);
    } else {
      // Extract local number if value starts with dial code
      if (value.startsWith(selectedCountry.dialCode)) {
        setLocalNumber(value.slice(selectedCountry.dialCode.length).trim());
      } else {
        setLocalNumber(value);
      }
    }
  }, [value, mode, selectedCountry]);

  const handleLocalNumberChange = (num: string) => {
    setLocalNumber(num);
    if (mode === "VN") {
      onChange(num);
    } else {
      const full = num.trim() ? `${selectedCountry.dialCode} ${num.trim()}` : "";
      onChange(full);
    }
  };

  const handleCountrySelect = (code: string) => {
    const matched = COUNTRY_CODES.find((c) => c.code === code);
    if (matched) {
      setSelectedCountry(matched);
      const full = localNumber.trim() ? `${matched.dialCode} ${localNumber.trim()}` : "";
      onChange(full);
    }
  };

  const toggleMode = () => {
    if (mode === "VN") {
      setMode("INT");
      const full = localNumber.trim() ? `${selectedCountry.dialCode} ${localNumber.trim()}` : "";
      onChange(full);
    } else {
      setMode("VN");
      onChange(localNumber);
    }
  };

  const defaultInputStyle =
    inputStyleClass ||
    "w-full px-3.5 py-2.5 bg-stone-950/70 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#0d9488]";

  return (
    <div className={`space-y-1 ${className}`}>
      {mode === "VN" ? (
        /* STANDARD VIETNAM MODE (DEFAULT FOR VN VISITORS): ALLOWS 0912... */
        <div>
          <input
            type="tel"
            required={required}
            placeholder={placeholder || "VD: 0912 743 327"}
            value={localNumber}
            onChange={(e) => handleLocalNumberChange(e.target.value)}
            className={defaultInputStyle}
          />
          <div className="flex justify-end mt-1">
          <button
              type="button"
              onClick={toggleMode}
              className="text-[10px] text-stone-800 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Globe size={11} />
              <span>Khách ở Nước ngoài? Bấm chọn Mã vùng Quốc tế</span>
            </button>
          </div>
        </div>
      ) : (
        /* INTERNATIONAL OVERSEAS MODE (AUTO-TRIGGERED FOR FOREIGN IP) */
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {/* Country Flag & Dial Code Select Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedCountry.code}
                onChange={(e) => handleCountrySelect(e.target.value)}
                className="appearance-none pl-2.5 pr-6 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#0d9488] cursor-pointer"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dialCode} ({c.name})
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-stone-400 pointer-events-none">
                ▼
              </span>
            </div>

            {/* Local Phone Number Input */}
            <input
              type="tel"
              required={required}
              placeholder={placeholder || selectedCountry.formatHint || "Mobile number..."}
              value={localNumber}
              onChange={(e) => handleLocalNumberChange(e.target.value)}
              className={`flex-1 ${defaultInputStyle}`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-400 px-0.5">
            <span className="text-teal-400 font-mono">
              {selectedCountry.flag} Phát hiện IP Quốc tế ({selectedCountry.name})
            </span>

            <button
              type="button"
              onClick={toggleMode}
              className="text-stone-400 hover:text-stone-200 underline cursor-pointer"
            >
              🇻🇳 Ở Việt Nam? Nhập đầu số 0...
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
