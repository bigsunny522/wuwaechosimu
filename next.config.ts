import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/supporter',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
