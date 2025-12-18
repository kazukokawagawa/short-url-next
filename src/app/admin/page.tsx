import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { LinksTable } from "@/app/dashboard/links-table" // 复用表格组件
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminPage() {
    const supabase = await createClient()

    // 1. 服务端再次校验权限 (双重保险)
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

    // 2. 获取数据：管理员可以看到 *所有* 链接
    // 这里的查询去掉了 .eq('user_id', user.id)
    const { data: allLinks } = await supabase
        .from('links')
        .select('*, profiles(email)') // 如果有关联，可以顺便把创建者的邮箱查出来
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-red-600">系统管理后台</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        管理系统内所有短链接资源
                    </p>
                </div>

                <div className="flex gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline">返回普通控制台</Button>
                    </Link>
                </div>
            </div>

            {/* 这里的 LinksTable 可能需要稍微改造以支持显示 "创建者" 列，
                或者你可以直接用现有的，它依然能工作，只是不显示是谁创建的 */}
            <LinksTable links={allLinks || []} />
        </div>
    )
}
