import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '178.128.127.161',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Suppress specific harmless warnings
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withPayload(nextConfig);
