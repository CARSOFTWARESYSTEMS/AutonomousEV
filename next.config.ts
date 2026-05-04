import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/workshop',
        destination: '/internships',
      },
    ];
  },
};

export default nextConfig;
