export interface CountryCodeInfo {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  formatHint: string;
}

export const COUNTRY_CODES: CountryCodeInfo[] = [
  { code: "VN", name: "Việt Nam", dialCode: "+84", flag: "🇻🇳", formatHint: "0912 743 327" },
  { code: "US", name: "Mỹ (United States)", dialCode: "+1", flag: "🇺🇸", formatHint: "(202) 555-0143" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", formatHint: "(416) 555-0199" },
  { code: "AU", name: "Úc (Australia)", dialCode: "+61", flag: "🇦🇺", formatHint: "0412 345 678" },
  { code: "JP", name: "Nhật Bản (Japan)", dialCode: "+81", flag: "🇯🇵", formatHint: "090 1234 5678" },
  { code: "KR", name: "Hàn Quốc (South Korea)", dialCode: "+82", flag: "🇰🇷", formatHint: "010 1234 5678" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", formatHint: "9123 4567" },
  { code: "GB", name: "Anh (United Kingdom)", dialCode: "+44", flag: "🇬🇧", formatHint: "07123 456789" },
  { code: "DE", name: "Đức (Germany)", dialCode: "+49", flag: "🇩🇪", formatHint: "0151 23456789" },
  { code: "FR", name: "Pháp (France)", dialCode: "+33", flag: "🇫🇷", formatHint: "06 12 34 56 78" },
  { code: "TW", name: "Đài Loan (Taiwan)", dialCode: "+886", flag: "🇹🇼", formatHint: "0912 345 678" },
  { code: "TH", name: "Thái Lan (Thailand)", dialCode: "+66", flag: "🇹🇭", formatHint: "081 234 5678" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", formatHint: "012-345 6789" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭", formatHint: "0917 123 4567" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿", formatHint: "021 123 4567" },
  { code: "SE", name: "Thụy Điển (Sweden)", dialCode: "+46", flag: "🇸🇪", formatHint: "070 123 45 67" },
  { code: "NO", name: "Na Uy (Norway)", dialCode: "+47", flag: "🇳🇴", formatHint: "412 34 567" },
  { code: "CH", name: "Thụy Sĩ (Switzerland)", dialCode: "+41", flag: "🇨🇭", formatHint: "079 123 45 67" },
  { code: "NL", name: "Hà Lan (Netherlands)", dialCode: "+31", flag: "🇳🇱", formatHint: "06 12345678" },
];
