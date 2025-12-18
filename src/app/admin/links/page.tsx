import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { LinksTable } from "@/app/dashboard/links-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AdminLinksPage() {
    const supabase = await createClient()

    // 1. 权限校验
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect("/login")

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return redirect("/dashboard")
    }

    // 2. 获取所有链接数据
    const { data: allLinks } = await supabase
        .from('links')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
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
                </div>
            </div>

            <LinksTable links={allLinks || []} />
        </div>
    )
}
