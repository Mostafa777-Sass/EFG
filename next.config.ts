import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Produces .next/standalone for the Docker image and the systemd service.
  output: "standalone",
  experimental: {
    serverActions: {
      // Admin image uploads go through Server Actions; allow generous multipart bodies.
      bodySizeLimit: "12mb",
    },
  },
  images: {
    qualities: [60, 75, 85],
  },
  async rewrites() {
    // English (the default locale) lives at "/" while the pages are defined
    // under app/(site)/[locale]. This path-based rewrite serves /about from
    // /en/about; see src/proxy.ts for why it is not left to next-intl.
    return {
      afterFiles: [
        { source: "/", destination: "/en" },
        {
          source: "/:path((?!(?:ar|en|admin|api|uploads|_next)(?:/|$)|.*\\..*).*)",
          destination: "/en/:path",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
