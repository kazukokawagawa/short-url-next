import { createClient } from "@/utils/supabase/server"
import { LinksTable } from "./links-table"
import { redirect } from "next/navigation"

export default async function Dashboard() {
    const supabase = await createClient()

    // 1. 二次确认用户登录（虽然中间件拦截了，但 Server Component 里再查一次是好习惯）
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect("/login")
    }

    // 2. 获取数据 (自动应用 RLS，只查出该用户的数据)
    const { data: links, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your shortened links and view analytics.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{user.email}</span>
                    {/* 这里可以放一个 Logout 按钮，稍后实现 */}
                </div>
            </div>

            <LinksTable links={links || []} />
        </div>
    )
}