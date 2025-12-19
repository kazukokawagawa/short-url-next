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
  maximumScale: 1,
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
        <link
          rel="stylesheet"
          href="https://cdn.jsdmirror.com/gh/CYYYY5/chiyupic@main/fonts/vivosans.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdmirror.com/gh/CYYYY5/chiyupic@main/fonts/Lexend.css"
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
          {/* 维护模式遮罩 - 仅通过路径白名单放行 Admin 页面，管理员可绕过 */}
          <MaintenanceGuard
            enabled={maintenanceConfig.enabled}
            message={maintenanceConfig.message}
            bypass={isAdmin}
          />
          <LoadingProvider>
            {/* 核心修改：用 main 包裹 children 并添加 flex-1 */}
            <main className="flex-1 w-full">
              {children}
            </main>
          </LoadingProvider>
          <SiteFooter />
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
