'use client'

import { createClient } from "@/utils/supabase/client"
import { LinksTable } from "./links-table"
import { useRouter } from "next/navigation"
import { signOut } from "./actions"
import { Button } from "@/components/ui/button"
import { CreateLinkDialog } from "./create-link-dialog"
import { ActionScale } from "@/components/action-scale"
import { FadeIn } from "@/components/animations/fade-in"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { LoaderCircle, ShieldCheck, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { HomeArrowLeftIcon } from "@/components/home-arrow-left-icon"
import { SmartLoading } from "@/components/smart-loading"
import { useLoading } from "@/components/providers/loading-provider"

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [links, setLinks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isHomeHovered, setIsHomeHovered] = useState(false)
    const router = useRouter()
    const { isLoading: isGlobalLoading, setIsLoading: setGlobalLoading } = useLoading()

    useEffect(() => {
        async function loadData() {
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/login")
                return
            }

            setUser(user)

            // Check if user is admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            setIsAdmin(profile?.role === 'admin')

            // 只获取当前用户的链接
            const { data: linksData } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            setLinks(linksData || [])
            setLoading(false)
            setGlobalLoading(false) // 确保全局加载状态关闭
        }
        loadData()
    }, [router, setGlobalLoading])

    // 刷新链接列表的函数
    const refreshLinks = async () => {
        const supabase = createClient()

        // 获取当前用户
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 只获取当前用户的链接
        const { data: linksData } = await supabase
            .from('links')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setLinks(linksData || [])
    }

    if (isGlobalLoading) {
        return null // 全局加载中，隐藏当前页面内容以实现无缝切换
    }

    if (loading) {
        return <SmartLoading />
    }

    return (
        <div className="relative min-h-screen">
            {/* 返回首页按钮 - 绝对定位在屏幕左上角 */}
            <FadeIn delay={0} className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
                <ActionScale
                    onMouseEnter={() => setIsHomeHovered(true)}
                    onMouseLeave={() => setIsHomeHovered(false)}
                >
                    <Button
                        variant="ghost"
                        className="-ml-2 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setGlobalLoading(true)
                            router.push("/")
                        }}
                    >
                        <HomeArrowLeftIcon isHovered={isHomeHovered} />
                        返回首页
                    </Button>
                </ActionScale>
            </FadeIn>

            {/* 主内容区域 */}
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* 头部导航栏重构：清晰分层 */}
                <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center">
                    {/* 左侧：标题和副标题 */}
                    <FadeIn delay={0}>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">控制台</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                欢迎回来，<span className="font-medium text-foreground">{user?.email}</span>
                            </p>
                        </div>
                    </FadeIn>

                    {/* 右侧：操作按钮组 */}
                    <FadeIn delay={0.1} className="flex items-center gap-4">
                        <CreateLinkDialog onSuccess={refreshLinks} />

                        {isAdmin && (
                            <ActionScale>
                                <Button
                                    variant="default"
                                    className="gap-2"
                                    onClick={() => {
                                        setGlobalLoading(true)
                                        router.push("/admin")
                                    }}
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    管理控制台
                                </Button>
                            </ActionScale>
                        )}

                        <form action={signOut}>
                            <ActionScale>
                                <Button variant="outline" className="gap-2">
                                    <LogOut className="h-4 w-4" />
                                    登出
                                </Button>
                            </ActionScale>
                        </form>
                    </FadeIn>
                </div>

                {/* 数据表格 */}
                <LinksTable links={links} onDeleteSuccess={refreshLinks} />
            </div>
        </div>
    )
}