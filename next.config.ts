import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    viewTransition: false,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
}

export default nextConfig
