import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Serve images from the public /uploads directory; also allow the site origin
    // itself (helpful for absolute-URL blur-placeholder edge cases in dev).
    remotePatterns: [],
  },
  experimental: {
    // Keep the transitive dep list explicit for Prisma / better-sqlite3 native
    // bindings; Next externalizes these correctly for the Node.js runtime.
    serverActions: { bodySizeLimit: '10mb' }, // gallery uploads
  },
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-better-sqlite3',
    'prisma',
    'better-sqlite3',
    'sharp',
  ],
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];
    return [{ source: '/:path*', headers: security }];
  },
  async redirects() {
    // WordPress → new URL map. Every entry preserves accumulated Google ranking.
    // Extend this as the old-site audit surfaces more legacy URLs.
    return [
      { source: '/examples', destination: '/gallery', permanent: true },
      { source: '/examples/', destination: '/gallery', permanent: true },
      // Category-tab-style deep links that Elementor generated
      { source: '/examples/showers', destination: '/showers', permanent: true },
      { source: '/examples/mirrors', destination: '/mirrors', permanent: true },
      { source: '/examples/railings', destination: '/railings', permanent: true },
      { source: '/examples/cladding', destination: '/cladding', permanent: true },
      { source: '/examples/bath', destination: '/bath-screens', permanent: true },
      { source: '/examples/custom', destination: '/custom', permanent: true },
      // Old Hebrew URL-encoded page slugs from WP
      { source: '/%d7%9b%d7%aa%d7%91%d7%95%d7%aa', destination: '/', permanent: true },
      { source: '/%d7%94%d7%a6%d7%94%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa', destination: '/accessibility', permanent: true },
      { source: '/%d7%9e%d7%93%d7%99%d7%a0%d7%99%d7%95%d7%aa-%d7%a4%d7%a8%d7%98%d7%99%d7%95%d7%aa', destination: '/privacy', permanent: true },
    ];
  },
};

export default config;
