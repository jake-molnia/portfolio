/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional: Bun-specific optimizations
  experimental: {
    serverComponentsExternalPackages: [], // Add packages that should run in Node.js if needed
  }
}

module.exports = nextConfig