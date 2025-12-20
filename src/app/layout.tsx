import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorProvider } from "@/components/theme-color-provider";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter } from "@/components/site-footer";
import { VerificationToast } from "@/components/verification-toast";
import React from "react";
import { getCachedSiteConfig, getAppearanceConfig, getMaintenanceConfig } from "@/lib/site-config";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MaintenanceGuard } from "@/components/maintenance-guard";
import { createClient } from "@/utils/supabase/server";
import { GridBackground } from "@/components/grid-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PWA Viewport 配置
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  // 移除 maximumScale 限制，允许低视力用户缩放页面
};

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getCachedSiteConfig();

  return {
    title: {
      template: `%s | ${siteConfig.name}`,
      default: `${siteConfig.name} - ${siteConfig.subtitle}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords.split(/[,，]/).map(k => k.trim()), // Support both English and Chinese commas
    authors: [{ name: siteConfig.authorName, url: siteConfig.authorUrl }],
    icons: {
      apple: "/icons/icon-192x192.png",
    },
    openGraph: {
      title: `${siteConfig.name} - ${siteConfig.subtitle}`,
      description: siteConfig.description,
      type: "website",
      siteName: siteConfig.name,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 从数据库读取外观配置
  const appearanceConfig = await getAppearanceConfig();

  // 读取维护模式配置
  const maintenanceConfig = await getMaintenanceConfig();

  // 检查管理员权限用于绕过维护模式
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 预连接CDN以加速字体加载 */}
        <link rel="preconnect" href="https://cdn.jsdmirror.com" crossOrigin="anonymous" />
        {/* 预加载LCP关键字体 (ExtraBold用于标题) */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://cdn.jsdmirror.com/gh/CYYYY5/chiyupic@main/fonts/vivosans/vivoSans-ExtraBold.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={appearanceConfig.themeMode}
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorProvider primaryColor={appearanceConfig.primaryColor} />
          {/* 全局拼图背景 */}
          <GridBackground className="flex flex-col min-h-screen">
            {/* 维护模式遮罩 */}
            <MaintenanceGuard
              enabled={maintenanceConfig.enabled}
              message={maintenanceConfig.message}
              bypass={isAdmin}
            />
            <LoadingProvider>
              <main className="flex-1 w-full">
                {children}
              </main>
            </LoadingProvider>
            <SiteFooter />
          </GridBackground>
          <Toaster position={appearanceConfig.toastPosition} />
          <React.Suspense fallback={null}>
            <VerificationToast />
          </React.Suspense>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}

