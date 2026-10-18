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
        // aerospace.gamyaa.in opens on the Aerospace page (served as its Gamyaa.in variant, see rewrites).
        source: "/",
        has: [
          {
            type: "host",
            value: "aerospace\\.gamyaa\\.in",
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
      {
        // The social card for aerospace.ishavasyam.org/space moved from the
        // opengraph-image convention to a plain .png URL. Anything that kept
        // the old address is sent to the new one instead of a 404.
        source: "/ishavasyam-space/opengraph-image",
        destination: "/ishavasyam-space/og-image.png",
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
        {
          // On aerospace.gamyaa.in, /aerospace shows Gamyaa.in in the top menu in place of EV.ENGINEER.
          source: '/aerospace',
          has: [
            {
              type: 'host',
              value: 'aerospace\\.gamyaa\\.in',
            },
          ],
          destination: '/gamyaa-aerospace',
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
