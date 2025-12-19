import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter } from "@/components/site-footer";
import { VerificationToast } from "@/components/verification-toast";
import React from "react";
import { getCachedSiteConfig } from "@/lib/site-config";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            {/* 核心修改：用 main 包裹 children 并添加 flex-1 */}
            <main className="flex-1 w-full">
              {children}
            </main>
          </LoadingProvider>
          <SiteFooter />
          <Toaster />
          <React.Suspense fallback={null}>
            <VerificationToast />
          </React.Suspense>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
