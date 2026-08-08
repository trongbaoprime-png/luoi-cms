"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface FooterLink {
  label: string;
  url: string;
}

export default function LuoiFooter() {
  const [logoUrl, setLogoUrl] = useState("/images/luoidonnhangang.png");
  const [siteName, setSiteName] = useState("LƯỜI DỌN NHÀ");
  const [footerFont, setFooterFont] = useState("mono");
  const [footerDesc, setFooterDesc] = useState(
    "Chia sẻ mẹo hay, sản phẩm tiện ích và giải pháp giúp cuộc sống nhẹ nhàng hơn mỗi ngày. Tự động áp mã giảm giá Shopee ưu đãi Facebook."
  );
  const [footerEmail, setFooterEmail] = useState("hello@luoidonnha.com");
  const [footerCopyright, setFooterCopyright] = useState(
    "© 2026 LƯỜI DỌN NHÀ. Bản quyền thuộc về luoidonnha.com."
  );

  const [col1Title, setCol1Title] = useState("KHÁM PHÁ");
  const [col1Links, setCol1Links] = useState<FooterLink[]>([
    { label: "Blog & Mẹo Hay", url: "/blog" },
    { label: "Sản phẩm tiện ích", url: "/san-pham" },
    { label: "Icon Facebook", url: "/#tool-widget" },
    { label: "Mã giảm giá Shopee", url: "/#tool-widget" },
  ]);

  const [col2Title, setCol2Title] = useState("HỖ TRỢ");
  const [col2Links, setCol2Links] = useState<FooterLink[]>([
    { label: "Hướng dẫn dán link", url: "/#guide" },
    { label: "Câu hỏi thường gặp", url: "/#faq" },
    { label: "Điều khoản dịch vụ", url: "/#terms" },
    { label: "Liên hệ hỗ trợ", url: "/#contact" },
  ]);

  const [socialFb, setSocialFb] = useState("https://facebook.com");
  const [socialInsta, setSocialInsta] = useState("https://instagram.com");
  const [socialTiktok, setSocialTiktok] = useState("https://tiktok.com");
  const [socialYoutube, setSocialYoutube] = useState("https://youtube.com");

  const [footerBg, setFooterBg] = useState("#ffffff");
  const [footerHoverColor, setFooterHoverColor] = useState("#0d4f4a");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          if (res.data.logo_url) setLogoUrl(res.data.logo_url);
          if (res.data.site_name) setSiteName(res.data.site_name);
          if (res.data.footer_font) setFooterFont(res.data.footer_font);
          else if (res.data.menu_font) setFooterFont(res.data.menu_font);

          if (res.data.footer_description) setFooterDesc(res.data.footer_description);
          if (res.data.footer_email) setFooterEmail(res.data.footer_email);
          if (res.data.footer_copyright) setFooterCopyright(res.data.footer_copyright);

          if (res.data.footer_col1_title) setCol1Title(res.data.footer_col1_title);
          if (res.data.footer_col1_links) {
            try {
              setCol1Links(JSON.parse(res.data.footer_col1_links));
            } catch {}
          }

          if (res.data.footer_col2_title) setCol2Title(res.data.footer_col2_title);
          if (res.data.footer_col2_links) {
            try {
              setCol2Links(JSON.parse(res.data.footer_col2_links));
            } catch {}
          }

          if (res.data.footer_social_fb !== undefined) setSocialFb(res.data.footer_social_fb);
          if (res.data.footer_social_insta !== undefined) setSocialInsta(res.data.footer_social_insta);
          if (res.data.footer_social_tiktok !== undefined) setSocialTiktok(res.data.footer_social_tiktok);
          if (res.data.footer_social_youtube !== undefined) setSocialYoutube(res.data.footer_social_youtube);

          if (res.data.footer_bg_color) setFooterBg(res.data.footer_bg_color);
          if (res.data.menu_color_hover) setFooterHoverColor(res.data.menu_color_hover);
        }
      })
      .catch(() => {});
  }, []);

  const fontClass =
    footerFont === "mono"
      ? "font-mono"
      : footerFont === "serif"
      ? "font-serif"
      : footerFont === "sans"
      ? "font-sans"
      : "font-mono";

  return (
    <footer style={{ backgroundColor: footerBg }} className={`border-t border-[#e7e5e4] pt-14 pb-10 ${fontClass}`}>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#f5f5f4]">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${siteName} Logo`}
                  width={160}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span className="font-bold text-lg text-stone-900 tracking-tight uppercase">
                  {siteName}
                </span>
              )}
            </div>

            <p className="text-xs text-[#78716c] leading-relaxed max-w-sm">
              {footerDesc}
            </p>
          </div>

          {/* Nav Column 1 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-[#1c1917]">
              {col1Title}
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#57534e]">
              {col1Links.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url || "#"}
                    className="hover:text-[#0d4f4a] transition-colors"
                    style={{ ["--hover-color" as any]: footerHoverColor }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav Column 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-[#1c1917]">
              {col2Title}
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#57534e]">
              {col2Links.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url || "#"}
                    className="hover:text-[#0d4f4a] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-black text-xs uppercase tracking-wider text-[#1c1917]">
              KẾT NỐI VỚI CHÚNG TÔI
            </h4>
            <div className="flex items-center gap-3">
              {socialFb && (
                <a
                  href={socialFb}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#1877f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-xs"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {socialInsta && (
                <a
                  href={socialInsta}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#e4405f] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-xs"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {socialTiktok && (
                <a
                  href={socialTiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity font-bold text-xs shadow-xs"
                >
                  🎵
                </a>
              )}
              {socialYoutube && (
                <a
                  href={socialYoutube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#ff0000] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-xs"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
            </div>

            {footerEmail && (
              <div className="flex items-center gap-2 text-xs text-[#78716c] font-medium pt-2">
                <Mail size={14} className="text-[#0d4f4a]" />
                <span>{footerEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 text-center text-xs text-[#a8a29e] font-medium">
          {footerCopyright}
        </div>
      </div>
    </footer>
  );
}
