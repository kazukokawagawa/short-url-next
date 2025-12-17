import { createClient } from "@/utils/supabase/server" // 引入服务端 Supabase
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShortenForm } from "./shorten-form" // *注意：我们将之前的 Client 端表单拆分出去

// 1. 我们先把之前的 Client 端表单代码拆成一个单独的组件
//    因为 page.tsx 即将变成 async server component，不能直接用 useState
//    请看下一步骤关于 ShortenForm 的代码
export default async function Home() {
  const supabase = await createClient()

  // 核心：在服务端直接获取用户Session
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center p-24 relative">

      {/* 顶部导航区 */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              {user.email}
            </span>
            <Link href="/dashboard">
              <Button>控制台</Button>
            </Link>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="outline">登录</Button>
          </Link>
        )}
      </div>

      {/* 主体卡片 */}
      <Card className="w-full max-w-[450px] mt-20">
        <CardHeader>
          <CardTitle className="text-2xl text-center">短链接生成器</CardTitle>
          <CardDescription className="text-center">
            Serverless & BaaS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 这里调用拆分出去的客户端表单组件 */}
          <ShortenForm />
        </CardContent>
      </Card>
    </main>
  )
}