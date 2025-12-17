import { createClient } from "@/utils/supabase/server" // 需配置服务端客户端
import { redirect } from "next/navigation"
import { LinksTable } from "@/app/dashboard/links-table" // 我们要把表格拆分成组件

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. 检查登录
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect("/login")
    }

    // 2. 获取数据 (因为配置了 RLS，这里只会自动返回该用户的数据)
    const { data: links } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="container py-10">
            <h1 className="text-2xl font-bold mb-4">Link Management</h1>
            {/* 3. 传给客户端组件渲染表格 */}
            <LinksTable data={links || []} />
        </div>
    )
}