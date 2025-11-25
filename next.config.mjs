/** @type {import('next').NextConfig} */

const CORE_API_BASE_URL = process.env.CORE_API_BASE_URL || 'http://localhost:8787'

export default {
  reactStrictMode: true,
  swcMinify: true,

  // Optional proxy to the core server. Keeps web API calls relative.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${CORE_API_BASE_URL}/api/:path*`,
      },
    ]
  },

  images: {
    remotePatterns: [
      // Supabase storage buckets and avatars
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Add any coach asset CDNs here as needed
    ],
  },

  // Small DX tweaks
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // Light security headers. Adjust CSP separately if you enable it.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' }
        ],
      },
    ]
  },
}
