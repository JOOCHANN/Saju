import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cloudflare Pages 호환
  images: {
    unoptimized: true,
  },
}

export default nextConfig
