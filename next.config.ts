/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopackを空設定で明示することで、Webpack設定との共存エラーを黙らせる
  experimental: {
    turbopack: {},
  },
  // 前回のWebpack設定
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;