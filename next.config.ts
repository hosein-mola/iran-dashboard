import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    nodeMiddleware: true,
    viewTransition: true,
  },
}

export default nextConfig
