import type { NextConfig } from "next";

// Security headers for Lighthouse Best Practices score
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Tắt header X-Powered-By (ẩn thông tin server)
  poweredByHeader: false,

  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
    // Cho phép domain ngoài nếu cần (mở rộng sau)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  compress: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return [
      // Security headers áp dụng cho toàn bộ site
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      // Cache static uploads dài hạn (Next.js tự quản lý /_next/static)
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // API cache
      {
        source: "/api/settings",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/api/geo",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;
