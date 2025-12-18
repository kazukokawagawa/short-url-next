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
import { LoaderCircle, Home, ShieldCheck, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [links, setLinks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const router = useRouter()

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

            const { data: linksData } = await supabase
                .from('links')
                .select('*')
                .order('created_at', { ascending: false })

            setLinks(linksData || [])
            setLoading(false)
        }
        loadData()
    }, [router])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <LoaderCircle className="h-8 w-8 text-muted-foreground opacity-50" />
                </motion.div>
            </div>
        )
    }

    return (
        // 1. 全局布局优化：增加约束容器 (max-w-6xl)
        <div className="container mx-auto max-w-6xl px-4 py-8">
            {/* 2. 头部导航栏重构：清晰分层 */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center">
                {/* 左侧：标题和副标题 + 返回主页按钮 */}
                <FadeIn delay={0} className="flex items-center gap-4">
                    <Link href="/">
                        <ActionScale>
                            <Button variant="outline" size="icon">
                                <Home className="h-4 w-4" />
                            </Button>
                        </ActionScale>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">控制台</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            欢迎回来，<span className="font-medium text-foreground">{user?.email}</span>
                        </p>
                    </div>
                </FadeIn>

                {/* 右侧：操作按钮组 */}
                <FadeIn delay={0.1} className="flex items-center gap-4">
                    <CreateLinkDialog />

                    {isAdmin && (
                        <Link href="/admin">
                            <ActionScale>
                                <Button variant="default" className="gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    管理控制台
                                </Button>
                            </ActionScale>
                        </Link>
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
            <LinksTable links={links} />
        </div>
    )
}