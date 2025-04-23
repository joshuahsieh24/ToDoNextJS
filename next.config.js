/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Use proper experimental features
    serverActions: true
  },
  // Disable image optimization if not needed
  images: {
    unoptimized: true,
  },
  // Add webpack configuration
  webpack: (config, { isServer }) => {
    // Handle node modules that need special treatment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        http: false,
        https: false,
        url: false,
      };
    }

    // Add rule for handling undici
    config.module.rules.push({
      test: /node_modules\/undici\/.*\.js$/,
      type: 'javascript/auto',
    });

    return config;
  },
}

module.exports = nextConfig; 