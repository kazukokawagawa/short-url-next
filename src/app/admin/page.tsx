'use client'

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Link2, Settings2, UserRoundCog, ArrowRight, ShieldCheck, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

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

export default function AdminDashboardPage() {
    const [isChecking, setIsChecking] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    useEffect(() => {
        // 客户端检查，配合 middleware 双重保护
        // 改为客户端组件以便使用 framer-motion 动画
        async function checkAuth() {
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

            setUser(user)
            setIsChecking(false)
        }
        checkAuth()
    }, [router])


    if (isChecking) {
        return <div className="min-h-screen flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <LoaderCircle className="h-8 w-8 text-muted-foreground opacity-50" />
            </motion.div>
        </div>
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12 min-h-[90vh] flex flex-col justify-center">
            <div className="mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0 }}
                    className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4"
                >
                    <ShieldCheck className="h-8 w-8 text-red-600 dark:text-red-400" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4"
                >
                    管理控制台
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg text-muted-foreground max-w-2xl mx-auto"
                >
                    欢迎回来，管理员。这里是系统的指挥中心，你可以管理所有链接、配置系统参数以及管理用户权限。
                </motion.p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                {/* --- 卡片 1: 链接管理 --- */}
                <motion.div variants={item}>
                    <Link href="/admin/links">
                        <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="p-6 h-full flex flex-col">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                                    <Link2 className="h-6 w-6" />
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
                    </Link>
                </motion.div>

                {/* --- 卡片 2: 系统设置 (占位) --- */}
                <motion.div variants={item}>
                    <div className="group relative overflow-hidden rounded-xl border bg-card/60 text-card-foreground shadow-sm transition-all h-full opacity-70 grayscale hover:grayscale-0 hover:opacity-100 cursor-not-allowed">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="px-3 py-1 absolute top-3 right-3 bg-muted text-muted-foreground text-xs rounded-full font-medium">
                            Coming Soon
                        </div>
                        <div className="p-6 h-full flex flex-col">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Settings2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">系统设置</h3>
                            <p className="text-muted-foreground mb-6 flex-grow">
                                全局配置、费率限制和系统参数设置。
                            </p>
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                开发中...
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

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-16 flex justify-center"
            >
                <Link href="/dashboard">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        ← 返回普通用户控制台
                    </Button>
                </Link>
            </motion.div>
        </div>
    )
}
