/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/moneycyberclicker' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/moneycyberclicker/' : '',
}

export default nextConfig
