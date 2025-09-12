import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // ✅ This disables lint errors from breaking the build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
