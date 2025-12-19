import type { NextConfig } from "next";
import { readFileSync } from "fs";
import withPWAInit from "@ducanh2912/next-pwa";

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

const withPWA = withPWAInit({
  dest: "public", // Service Worker 输出目录
  cacheOnFrontEndNav: true, // 在前端导航时启用缓存
  aggressiveFrontEndNavCaching: true, // 激进的缓存策略
  reloadOnOnline: true, // 网络恢复时重新加载
  disable: process.env.NODE_ENV === "development", // 开发环境禁用 PWA
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_COMMIT_HASH: process.env.VERCEL_GIT_COMMIT_SHA
      ? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)
      : 'dev-build',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default withPWA(nextConfig);
