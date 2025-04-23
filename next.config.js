/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['undici'],
  experimental: {
    esmExternals: false
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

    return config;
  },
}

module.exports = nextConfig; 