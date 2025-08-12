/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build optimizations
  reactStrictMode: false, // Disable in production for faster builds
  swcMinify: true, // Use SWC for faster minification
  
  // ESLint configuration - allow warnings but not errors
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'api.tudominio.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Reduce i18n complexity for faster builds - keep only Spanish for now
  i18n: {
    locales: ['es'],
    defaultLocale: 'es',
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  
  // Build performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-accordion', '@radix-ui/react-tabs', 'framer-motion'],
    webpackBuildWorker: true, // Faster builds
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            chunks: 'all',
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig