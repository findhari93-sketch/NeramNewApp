import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
