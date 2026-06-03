/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dnxvz6afy/**',
      },
    ],
    unoptimized: false,
  },
  output: 'standalone',
};

export default nextConfig;
