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

            // 0. 清理已过期的链接 (满足用户"删除!!"的要求)
            await supabase
                .from('links')
                .delete()
                .lt('expires_at', new Date().toISOString())

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

        // 0. 清理已过期的链接
        await supabase
            .from('links')
            .delete()
            .lt('expires_at', new Date().toISOString())

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
        <div className="min-h-screen">
            {/* 主内容区域 */}
            <div className="container mx-auto max-w-6xl px-4 pt-16 pb-8 md:pt-24 lg:pt-32">
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
                    <FadeIn delay={0.1} className="flex items-center gap-2 md:gap-3">
                        {/* 返回首页按钮 */}
                        <ActionScale
                            onMouseEnter={() => setIsHomeHovered(true)}
                            onMouseLeave={() => setIsHomeHovered(false)}
                            onTouchStart={() => setIsHomeHovered(true)}
                            onTouchEnd={() => setIsHomeHovered(false)}
                        >
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:w-auto md:px-4"
                                onClick={() => {
                                    setGlobalLoading(true)
                                    router.push("/")
                                }}
                            >
                                <HomeArrowLeftIcon isHovered={isHomeHovered} />
                                <span className="hidden md:inline">返回首页</span>
                            </Button>
                        </ActionScale>

                        <CreateLinkDialog onSuccess={refreshLinks} />

                        {isAdmin && (
                            <ActionScale>
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="md:w-auto md:px-4 md:gap-2"
                                    onClick={() => {
                                        setGlobalLoading(true)
                                        router.push("/admin")
                                    }}
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="hidden md:inline">管理控制台</span>
                                </Button>
                            </ActionScale>
                        )}

                        <form action={signOut}>
                            <ActionScale>
                                <Button variant="outline" size="icon" className="md:w-auto md:px-4 md:gap-2">
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden md:inline">登出</span>
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