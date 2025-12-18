'use client'

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { LinksTable } from "@/app/dashboard/links-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { useEffect, useState } from "react"
import { LoaderCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminLinksPage() {
    const [links, setLinks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const refreshLinks = async () => {
        const supabase = createClient()

        // 1. 权限校验
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

        // 2. 获取所有链接数据
        // 修改点：去掉了 profiles(email)，只用 * 即可获取包括 user_email 在内的所有字段
        const { data: allLinks } = await supabase
            .from('links')
            .select('*')
            .order('created_at', { ascending: false })

        setLinks(allLinks || [])
        setLoading(false)
    }

    useEffect(() => {
        refreshLinks()
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
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center">
                <FadeIn delay={0} className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">全局链接管理</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            查看和管理系统内的所有短链接
                        </p>
                    </div>
                </FadeIn>
            </div>

            <LinksTable links={links} isAdmin={true} onDeleteSuccess={refreshLinks} />
        </div>
    )
}
