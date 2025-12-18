'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"
import { getFriendlyErrorMessage } from "@/utils/error-mapping"
import { headers } from "next/headers"

import { retryQuery } from "@/utils/retry"

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

    // 获取站点设置，检查是否允许公开缩短
    const { data: siteSettings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'site')
        .single()

    const allowPublicShorten = siteSettings?.value?.allowPublicShorten ?? true

    // 如果不允许公开缩短且用户未登录，返回需要登录标记
    if (!user && !allowPublicShorten) {
        return { error: "User not authenticated", needsLogin: true }
    }

    const url = formData.get('url') as string
    const customSlug = formData.get('slug') as string
    const isNoIndex = formData.get('isNoIndex') === 'true' // 获取 isNoIndex 参数

    // 获取配置的短码长度（带自动重试）
    let slugLength = 6
    const { data: linksSettings, error: settingsError } = await retryQuery<{ value: any }>(() =>
        supabase
            .from('settings')
            .select('value')
            .eq('key', 'links')
            .single()
    )

    // 🔍 调试日志
    console.log('--- createLink Debug ---')
    console.log('settingsError:', settingsError)
    console.log('linksSettings:', JSON.stringify(linksSettings))
    console.log('linksSettings?.value:', linksSettings?.value)
    console.log('typeof value:', typeof linksSettings?.value)
    console.log('slugLength in value:', linksSettings?.value?.slugLength)

    if (linksSettings?.value?.slugLength) {
        slugLength = Number(linksSettings.value.slugLength) || 6
    }

    console.log('Final slugLength:', slugLength)
    console.log('------------------------')

    // 如果用户提供了自定义短码就用，否则生成配置长度的随机短码
    const slug = customSlug || nanoid(slugLength)

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
            user_id: user?.id ?? null,
            user_email: user?.email ?? null,
            is_no_index: isNoIndex
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
    // 🔴 修改点
    if (!user) {
        return { error: "User not authenticated", needsLogin: true }
    }

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