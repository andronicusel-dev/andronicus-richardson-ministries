import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Picture uploads from the admin area need a larger action payload than the 1 MB default.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
