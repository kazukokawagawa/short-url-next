import { createClient } from "@/utils/supabase/server"
import { LinksTable } from "./links-table"
import { redirect } from "next/navigation"
import { signOut } from "./actions"
import { Button } from "@/components/ui/button"
import { CreateLinkDialog } from "./create-link-dialog"
import { ActionScale } from "@/components/action-scale"

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect("/login")

    const { data: links } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        // 1. 全局布局优化：增加约束容器 (max-w-6xl)
        <div className="container mx-auto max-w-6xl px-4 py-8">
            {/* 2. 头部导航栏重构：清晰分层 */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center">
                {/* 左侧：标题和副标题 */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">控制台</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        欢迎回来，<span className="font-medium text-foreground">{user.email}</span>
                    </p>
                </div>

                {/* 右侧：操作按钮组 */}
                <div className="flex items-center gap-4">
                    <CreateLinkDialog />

                    <form action={signOut}>
                        <ActionScale>
                            <Button variant="outline">登出</Button>
                        </ActionScale>
                    </form>
                </div>
            </div>

            {/* 数据表格 */}
            <LinksTable links={links || []} />
        </div>
    )
}