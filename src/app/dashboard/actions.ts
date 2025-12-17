'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"

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
        // 实际项目中这里应该返回错误给前端，这里简化处理
        return
    }

    // 关键：刷新 Dashboard 数据，关闭弹窗后用户能立马看到新数据
    revalidatePath('/dashboard')

    // 注意：这里我们不 redirect，只是刷新当前页面的数据
}

// 2. 登出的 Action
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}