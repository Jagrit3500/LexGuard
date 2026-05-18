import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  // Let Node.js require these natively — avoids DOMMatrix browser API error
  serverExternalPackages: ['pdf-parse', 'mammoth'],
};

export default nextConfig;
