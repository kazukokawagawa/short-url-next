'use server'

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
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

    const origin = (await headers()).get("origin")

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        // 2. 使用工具函数转换错误信息
        return { error: getFriendlyErrorMessage(error) }
    }

    // 在注册成功后，创建 profile 记录
    // 使用 admin client 绕过 RLS 策略
    if (data.user) {
        // 检查是否配置了 service role key
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY is not configured. Profile creation skipped.')
            console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
            // 不阻止注册流程，只是跳过 profile 创建
            return { success: true }
        }

        try {
            // 创建 admin client（需要 service role key）
            const { createClient: createAdminClient } = await import('@supabase/supabase-js')
            const supabaseAdmin = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            )

            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: data.user.email,
                        role: 'user' // 默认角色为普通用户
                    }
                ])

            if (profileError) {
                console.error('Failed to create profile:', profileError)
                // 注意：即使 profile 创建失败，我们也不阻止注册流程
                // 因为用户账号已经创建，可以稍后修复 profile
            }
        } catch (error) {
            console.error('Error creating profile:', error)
        }
    }

    return { success: true }
}