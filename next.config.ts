import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Cố định workspace root về đúng thư mục dự án — tránh Next chọn nhầm
  // root do có package-lock.json khác ở C:\Users\Admin\Documents\.
  turbopack: {
    root: path.resolve(__dirname),
  },
  generateBuildId: async () => {
    // Force unique build ID → bypass Vercel compiled-output cache
    return `build-${Date.now()}`;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "mandomood.vercel.app",
        "*.vercel.app",
      ],
    },
  },
};

export default nextConfig;
