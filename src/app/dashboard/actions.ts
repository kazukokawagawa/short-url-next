'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"
import { getFriendlyErrorMessage } from "@/utils/error-mapping"

// 1. 创建短链接的 Action
export async function createLink(formData: FormData) {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const url = formData.get('url') as string
    const slug = formData.get('slug') as string || nanoid(6) // 如果用户没填自定义短码，就生成一个

    if (!url) return

    const { error } = await supabase
        .from('links')
        .insert({
            original_url: url,
            slug: slug,
            user_id: user.id
        })

    if (error) {
        console.error(error)
        return { error: getFriendlyErrorMessage(error) }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

// 2. 登出的 Action
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}

// 3. 删除链接 Action
export async function deleteLink(id: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: getFriendlyErrorMessage(error) }
    }

    revalidatePath('/dashboard')
    return { success: true }
}