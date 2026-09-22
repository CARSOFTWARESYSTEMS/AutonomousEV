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
            value: "aerospace\\.ishavasyam\\.org",
          },
        ],
        destination: "/space",
        permanent: true,
      },
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
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "cybersecurity\\.uflight\\.in",
          },
        ],
        destination: "/aerospace",
        permanent: true,
      },
      {
        // Corrected route spelling (evAutoRiksha -> evAutoRickshaw). Query
        // parameters on the incoming request are passed through automatically.
        source: "/internships/evAutoRiksha",
        destination: "/internships/evAutoRickshaw",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return {
      // /space exists on the filesystem, so overriding it per host has to run
      // before the filesystem check.
      beforeFiles: [
        {
          source: '/space',
          has: [
            {
              type: 'host',
              value: 'aerospace\\.ishavasyam\\.org',
            },
          ],
          destination: '/ishavasyam-space',
        },
      ],
      afterFiles: [
        {
          source: '/workshop',
          destination: '/internships',
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
