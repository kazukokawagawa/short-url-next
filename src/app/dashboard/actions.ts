'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"
import { getFriendlyErrorMessage } from "@/utils/error-mapping"
import { headers } from "next/headers"

// 1. 简单的格式校验
function isValidUrl(url: string) {
    try {
        const parsed = new URL(url)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch (err) {
        return false
    }
}

// 2. 检查链接是否可用 (Ping 一下)
async function checkUrlAvailability(url: string) {
    try {
        // 设置 5 秒超时，防止卡住
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(url, {
            method: 'HEAD', // 只请求头信息，不下载内容，速度快
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MyShortener/1.0; +http://your-domain.com)' // 伪装成友好的爬虫
            }
        })

        clearTimeout(timeoutId)

        // 只要状态码不是 404 或 5xx，通常都视为可用
        // 注意：有些网站屏蔽 HEAD 请求会返回 405，这也算可用
        return res.status !== 404 && res.status < 500
    } catch (error) {
        // 假如 HEAD 失败（有些网站完全屏蔽），再尝试一次 GET
        try {
            // 这里可以写 GET 重试逻辑，或者直接返回 false
            // 为了演示简单，如果连不上通常就是 false
            return false
        } catch (e) {
            return false
        }
    }
}

// 1. 创建短链接的 Action
export async function createLink(formData: FormData) {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const url = formData.get('url') as string
    const slug = formData.get('slug') as string || nanoid(6) // 如果用户没填自定义短码，就生成一个

    // --- 格式检查 ---
    if (!url || !isValidUrl(url)) {
        return { error: "请输入以 http:// 或 https:// 开头的有效网址" }
    }

    // --- 防递归检查 (禁止缩短本站链接) ---
    const headersList = await headers()
    const host = headersList.get("host") // 获取当前域名 (如 localhost:3000)
    if (host && url.includes(host)) {
        return { error: "不能缩短本站的链接" }
    }

    // --- 可用性检查 (可选，建议开启) ---
    // 这会增加几秒钟的等待时间
    const isAlive = await checkUrlAvailability(url)
    if (!isAlive) {
        return { error: "该链接无法访问或已失效，请检查后重试" }
    }

    // --- 黑名单/安全检查 (简易版) ---
    const blackList = ['malware.com', 'phishing.site']
    if (blackList.some(domain => url.includes(domain))) {
        return { error: "该链接因安全原因被禁止" }
    }

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