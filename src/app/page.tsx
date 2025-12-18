'use client'

import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShortenForm } from "./shorten-form"
import { FadeIn } from "@/components/animations/fade-in"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { LogIn, LayoutDashboard } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  return (
    // 1. 改用 min-h-[100dvh] 适配移动端浏览器地址栏
    // 2. 使用 justify-center 让内容在垂直方向更居中
    // 3. 手机端 p-4 (紧凑)，电脑端 p-24 (宽敞)
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background relative p-4 md:p-24">

      {/* 顶部导航区 */}
      {/* 手机端稍微往下挪一点 (top-6) 避开灵动岛，电脑端 top-8 */}
      {!loading && (
        <FadeIn delay={0} className="absolute top-6 right-6 md:top-8 md:right-8 z-20">
          {user ? (
            <div className="flex items-center gap-4">
              {/* 手机端隐藏邮箱，节省空间 */}
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user.email}
              </span>
              <Link href="/dashboard">
                {/* 手机端按钮稍微小一点 */}
                <Button size="sm" className="md:h-10 md:px-4 md:py-2 gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  控制台
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                登录
              </Button>
            </Link>
          )}
        </FadeIn>
      )}

      {/* ✨ 核心卡片区域 ✨
         - w-full: 手机端占满宽度
         - max-w-md: 限制最大宽度，防止在大屏幕太宽
         - shadow-xl: 加深阴影，更有质感
         - border-0 sm:border: 手机端去掉边框(看起来更像原生背景)，电脑端保留边框
      */}
      <div className="w-full max-w-md z-10">
        <Card className="w-full border-0 shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
          <CardHeader className="text-center pb-2 sm:pb-6">
            <FadeIn delay={0.1}>
              <CardTitle className="text-3xl font-extrabold tracking-tight lg:text-4xl">
                LinkFlow
              </CardTitle>
            </FadeIn>
            <FadeIn delay={0.2}>
              <CardDescription className="text-base mt-2">
                让链接更短，让分享更简单
              </CardDescription>
            </FadeIn>
          </CardHeader>
          <CardContent>
            <FadeIn delay={0.3}>
              {/* 传递 user 给表单 */}
              <ShortenForm user={user} />
            </FadeIn>
          </CardContent>
        </Card>
      </div>

    </main>
  )
}