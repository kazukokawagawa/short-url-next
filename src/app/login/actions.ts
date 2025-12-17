'use server'

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { getFriendlyErrorMessage } from "@/utils/error-mapping" // 1. 引入

export async function login(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // 2. 使用工具函数转换错误信息
        return { error: getFriendlyErrorMessage(error) }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
    })

    if (error) {
        // 2. 使用工具函数转换错误信息
        return { error: getFriendlyErrorMessage(error) }
    }

    return { success: true }
}