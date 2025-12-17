import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | LinkFlow", // %s 会被子页面的 title 替换
    default: "LinkFlow - 下一代短链接生成器", // 如果子页面没写 title，就用这个
  },
  description: "基于 Next.js 构建的现代化短链接工具。支持自定义后缀、点击统计与隐私保护。",
  keywords: ["短链接", "URL Shortener", "Link Management", "Next.js"],
  authors: [{ name: "Your Name", url: "https://your-website.com" }],
  // OpenGraph 用于社交媒体分享（如推特、微信预览）
  openGraph: {
    title: "LinkFlow - 下一代短链接生成器",
    description: "让链接更短，让分享更简单。",
    type: "website",
    siteName: "LinkFlow",
  },
};

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SiteFooter />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
