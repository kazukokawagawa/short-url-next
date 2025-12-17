import { createClient } from "@/utils/supabase/server"
import { LinksTable } from "./links-table"
import { redirect } from "next/navigation"
import { signOut } from "./actions"
import { Button } from "@/components/ui/button"
import { CreateLinkDialog } from "./create-link-dialog"

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect("/login")

    const { data: links } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto py-10">
            {/* 顶部 Header */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">控制台</h1>
                    <p className="text-muted-foreground mt-1">
                        欢迎回来, {user.email}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* 新建按钮 */}
                    <CreateLinkDialog />

                    {/* 登出按钮 (放在 form 里以触发表单提交) */}
                    <form action={signOut}>
                        <Button variant="outline">登出</Button>
                    </form>
                </div>
            </div>

            {/* 数据表格 */}
            <LinksTable links={links || []} />
        </div>
    )
}