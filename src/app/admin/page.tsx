'use client'

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Link2, Settings2, ShieldCheck, ArrowRight, UserRoundCog } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { SmartLoading } from "@/components/smart-loading"
import Link from "next/link"
import { ActionScale } from "@/components/action-scale"
import { useLoading } from "@/components/providers/loading-provider"

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { isLoading: isGlobalLoading, setIsLoading: setGlobalLoading } = useLoading()

    useEffect(() => {
        async function checkAdmin() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin') {
                router.push("/dashboard")
                return
            }

            setLoading(false)
            setGlobalLoading(false)
        }
        checkAdmin()
    }, [router, setGlobalLoading])

    if (loading) return <SmartLoading />

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* 主内容区域 */}
            <div className="flex-grow container mx-auto max-w-5xl px-4 pt-24 pb-8 md:pt-36 lg:pt-44">
                <div className="w-full">
                    {/* 顶部标题区 */}
                    <FadeIn delay={0} className="mb-12 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">管理控制台</h1>
                        <p className="text-muted-foreground mt-4 text-lg">
                            系统监控、配置管理与数据分析中心
                        </p>
                    </FadeIn>

                    {/* 卡片网格 */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {/* --- 卡片 1: 链接管理 --- */}
                        <motion.div variants={item}>
                            <div onClick={() => { setGlobalLoading(true); router.push("/admin/links") }}>
                                <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-6 h-full flex flex-col">
                                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300 relative">
                                            <Link2 className="h-6 w-6 transition-all duration-300 group-hover:opacity-0 group-hover:scale-0" />
                                            <ArrowRight className="h-6 w-6 absolute transition-all duration-300 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">全局链接管理</h3>
                                        <p className="text-muted-foreground mb-6 flex-grow">
                                            查看、搜索和管理系统中的所有短链接资源。
                                        </p>
                                        <div className="flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                                            进入管理 <ArrowRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* --- 卡片 2: 系统设置 --- */}
                        <motion.div variants={item}>
                            <div onClick={() => { setGlobalLoading(true); router.push("/admin/settings") }}>
                                <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-6 h-full flex flex-col">
                                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 relative">
                                            <Settings2 className="h-6 w-6 transition-all duration-300 group-hover:opacity-0 group-hover:scale-0" />
                                            <ArrowRight className="h-6 w-6 absolute transition-all duration-300 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">系统设置</h3>
                                        <p className="text-muted-foreground mb-6 flex-grow">
                                            全局配置、速率限制和系统参数设置。
                                        </p>
                                        <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                                            进入设置 <ArrowRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* --- 卡片 3: 用户管理 (占位) --- */}
                        <motion.div variants={item}>
                            <div className="group relative overflow-hidden rounded-xl border bg-card/60 text-card-foreground shadow-sm transition-all h-full opacity-70 grayscale hover:grayscale-0 hover:opacity-100 cursor-not-allowed">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="px-3 py-1 absolute top-3 right-3 bg-muted text-muted-foreground text-xs rounded-full font-medium">
                                    Coming Soon
                                </div>
                                <div className="p-6 h-full flex flex-col">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                        <UserRoundCog className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">用户与权限</h3>
                                    <p className="text-muted-foreground mb-6 flex-grow">
                                        管理注册用户、黑名单及管理员权限分配。
                                    </p>
                                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        开发中...
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Footer - 需要下滑才能看见 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="py-16 flex justify-center"
            >
                <ActionScale>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setGlobalLoading(true)
                            router.push("/dashboard")
                        }}
                        className="text-muted-foreground hover:text-foreground group relative w-48 overflow-hidden h-10"
                    >
                        <span className="flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-90 absolute inset-0">
                            ← 返回普通用户控制台
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-90 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                    </Button>
                </ActionScale>
            </motion.div>
        </div>
    )
}
