import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yydvpwjvxyhyplzpxdds.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // 단지 대표 사진 업로드가 Server Action 으로 들어온다. 기본 1MB 로는
    // site-images 버킷 상한(10MB)에 한참 못 미쳐 업로드가 413 으로 막힌다.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
