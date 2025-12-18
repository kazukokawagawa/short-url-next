'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { getFriendlyErrorMessage } from "@/utils/error-mapping"

// 管理员删除链接 Action (不限制 user_id)
export async function adminDeleteLink(id: number) {
    const supabase = await createClient()

    // 1. 验证用户身份
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated", needsLogin: true }
    }

    // 2. 验证管理员权限
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: "Unauthorized: Admin access required" }
    }

    // 3. 执行删除 (不检查 user_id，管理员可以删除任何链接)
    const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: getFriendlyErrorMessage(error) }
    }

    revalidatePath('/admin/links')
    return { success: true }
}
