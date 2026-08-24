import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "aerospace\\.ev\\.engineer",
          },
        ],
        destination: "/aerospace",
        permanent: true,
      },
    ];
  },

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
