import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "encrypted-media=(self https://w.soundcloud.com)",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/calculator",
        destination: "/nata-cutoff-calculator",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
