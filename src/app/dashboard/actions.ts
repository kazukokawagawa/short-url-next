'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteLink(id: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)

    if (error) throw error

    // 刷新页面数据，让表格自动更新，无需手动刷新
    revalidatePath('/dashboard')
}