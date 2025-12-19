import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
    const { url, slug, expiresAt } = await request.json()
    const supabase = await createClient()

    // 1. 检查登录状态
    const { data: { user } } = await supabase.auth.getUser()

    // 获取站点设置，检查是否允许公开缩短
    const { data: siteSettings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'site')
        .single()

    const allowPublicShorten = siteSettings?.value?.allowPublicShorten ?? true

    // 如果不允许公开缩短且用户未登录，返回 401
    if (!user && !allowPublicShorten) {
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

    // --- Safe Browsing + 可访问性检查 (使用共享函数) ---
    const { validateUrl } = await import('@/lib/url-validation')
    const validationResult = await validateUrl(url, { logPrefix: '[API/shorten]' })

    if (!validationResult.valid) {
        return NextResponse.json({
            error: validationResult.errorCode || validationResult.error,
            threats: validationResult.threats,
            statusCode: validationResult.statusCode
        }, { status: 400 })
    }


    // 如果用户提供了 slug，就用用户的；否则生成一个新的
    let slugLength = 6
    const { data: linksSettings, error: settingsError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'links')
        .single()

    // 🔍 调试日志
    console.log('--- Slug Length Debug ---')
    console.log('Settings Error:', settingsError)
    console.log('Raw linksSettings:', linksSettings)
    console.log('linksSettings.value:', linksSettings?.value)
    console.log('typeof value:', typeof linksSettings?.value)
    console.log('slugLength in value:', linksSettings?.value?.slugLength)

    let defaultExpiration = 0
    if (linksSettings?.value?.slugLength) {
        slugLength = Number(linksSettings.value.slugLength) || 6
        defaultExpiration = Number(linksSettings.value.defaultExpiration) || 0
    }

    console.log('Final slugLength:', slugLength)
    console.log('Default Expiration:', defaultExpiration)
    console.log('-------------------------')

    const finalSlug = slug || nanoid(slugLength)

    // 计算过期时间
    let finalExpiresAt = null

    if (expiresAt) {
        finalExpiresAt = expiresAt
    } else if (defaultExpiration > 0) {
        const date = new Date()
        date.setMinutes(date.getMinutes() + defaultExpiration)
        finalExpiresAt = date.toISOString()
    }

    // 2. 插入数据
    const { data, error } = await supabase
        .from('links')
        .insert([{
            original_url: url,
            slug: finalSlug,
            user_id: user?.id ?? null,
            user_email: user?.email ?? null,
            expires_at: finalExpiresAt
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