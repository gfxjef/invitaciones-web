/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'api.tudominio.com'],
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
}

module.exports = nextConfig