import type { Metadata } from "next";
import { Be_Vietnam_Pro, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luoidonnha.com"),
  title: "Lười Dọn Nhà: Nhà vẫn gọn, dù bạn rất lười",
  description: "Mẹo nhà gọn, review đồ gia dụng và sản phẩm tiện ích giúp cuộc sống nhẹ nhàng hơn mỗi ngày.",
  keywords: ["mẹo nhà gọn", "review đồ gia dụng", "mẹo nhà cửa", "đồ dùng gia đình", "đồ gia dụng thông minh"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Lười Dọn Nhà: Nhà vẫn gọn, dù bạn rất lười",
    description: "Mẹo nhà gọn, review đồ gia dụng và sản phẩm tiện ích giúp cuộc sống nhẹ nhàng hơn mỗi ngày.",
    locale: "vi_VN",
    type: "website",
    url: "https://luoidonnha.com/",
    siteName: "Lười Dọn Nhà: Nhà vẫn gọn, dù bạn rất lười",
    images: [
      {
        url: "/images/banner.png",
        width: 1774,
        height: 887,
        alt: "Nhà vẫn gọn, dù bạn rất lười.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lười Dọn Nhà: Nhà vẫn gọn, dù bạn rất lười",
    description: "Mẹo nhà gọn, review đồ gia dụng và sản phẩm tiện ích giúp cuộc sống nhẹ nhàng hơn mỗi ngày.",
    images: ["/images/banner.png"],
  },
};

import { AttributionTracker } from "@/components/AttributionTracker";
import { ContactClickTracker } from "@/components/ContactClickTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-ink">
        <AttributionTracker />
        <ContactClickTracker />
        {children}
      </body>
    </html>
  );
}
