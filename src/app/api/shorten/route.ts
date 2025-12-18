import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
    const { url, slug } = await request.json()
    const supabase = await createClient()

    // 1. 检查登录状态
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    // --- URL 格式验证 ---
    try {
        const urlObject = new URL(url)
        // 只允许 http 和 https 协议
        if (!['http:', 'https:'].includes(urlObject.protocol)) {
            return NextResponse.json({
                error: 'Invalid URL protocol. Only HTTP and HTTPS are allowed.'
            }, { status: 400 })
        }
    } catch (error) {
        return NextResponse.json({
            error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://'
        }, { status: 400 })
    }
    // ---------------------

    // --- Slug 字符验证 ---
    // 允许：大小写字母 (a-z, A-Z)、数字 (0-9)、连字符 (-)、下划线 (_)
    const slugRegex = /^[a-zA-Z0-9_-]+$/
    if (slug && !slugRegex.test(slug)) {
        return NextResponse.json({
            error: 'Invalid custom alias. Only letters, numbers, hyphens (-), and underscores (_) are allowed.'
        }, { status: 400 })
    }
    // -----------------------

    // --- URL 可访问性检测 ---
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

        const response = await fetch(url, {
            method: 'HEAD', // 使用 HEAD 请求，只获取响应头，更快
            signal: controller.signal,
            redirect: 'follow', // 跟随重定向
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.133 Safari/534.16'
            }
        })

        clearTimeout(timeoutId)

        // 检查响应状态
        if (!response.ok) {
            return NextResponse.json({
                error: 'URL_NOT_ACCESSIBLE',
                statusCode: response.status
            }, { status: 400 })
        }
    } catch (error: any) {
        // 处理不同类型的错误
        if (error.name === 'AbortError') {
            return NextResponse.json({
                error: 'URL_TIMEOUT'
            }, { status: 400 })
        }

        // 其他网络错误
        return NextResponse.json({
            error: 'URL_VERIFICATION_FAILED'
        }, { status: 400 })
    }
    // -----------------------

    // 如果用户提供了 slug，就用用户的；否则生成一个新的
    const finalSlug = slug || nanoid(6)

    // 2. 插入数据
    const { data, error } = await supabase
        .from('links')
        .insert([{
            original_url: url,
            slug: finalSlug,
            user_id: user.id,
            user_email: user.email
        }])
        .select()
        .single()

    if (error) {
        // 如果由于 slug 重复导致唯一性约束错误
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Custom alias already exists' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ slug: data.slug, original_url: data.original_url })
}