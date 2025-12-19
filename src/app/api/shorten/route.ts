import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { nanoid } from 'nanoid'

import { getSiteConfig, getLinksConfig } from '@/lib/site-config'
import { validateUrl, validateSlug } from '@/lib/url-validation'
import { processLinkPassword } from '@/lib/password'
import { checkPublicAccess } from '@/utils/auth'

export async function POST(request: Request) {
    const { url, slug, expiresAt, passwordType, password } = await request.json()
    const supabase = await createClient()

    // 使用统一的认证检查
    const siteConfig = await getSiteConfig()
    const authResult = await checkPublicAccess(supabase, siteConfig.allowPublicShorten)
    if (authResult.error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = authResult.user

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    // --- URL 格式验证 ---
    try {
        const urlObject = new URL(url)
        if (!['http:', 'https:'].includes(urlObject.protocol)) {
            return NextResponse.json({
                error: 'Invalid URL protocol. Only HTTP and HTTPS are allowed.'
            }, { status: 400 })
        }
    } catch {
        return NextResponse.json({
            error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://'
        }, { status: 400 })
    }

    // --- Slug 验证（格式 + 黑名单）---
    if (slug) {
        const slugValidation = await validateSlug(slug)
        if (!slugValidation.valid) {
            return NextResponse.json({
                error: slugValidation.errorCode || slugValidation.error
            }, { status: 400 })
        }
    }

    // --- Safe Browsing + 可访问性检查 ---
    const validationResult = await validateUrl(url, { logPrefix: '[API/shorten]' })

    if (!validationResult.valid) {
        return NextResponse.json({
            error: validationResult.errorCode || validationResult.error,
            threats: validationResult.threats,
            statusCode: validationResult.statusCode
        }, { status: 400 })
    }

    // 使用统一的设置获取函数
    const linksConfig = await getLinksConfig()
    const finalSlug = slug || nanoid(linksConfig.slugLength)

    // 计算过期时间
    let finalExpiresAt = null

    if (expiresAt) {
        finalExpiresAt = expiresAt
    } else if (linksConfig.defaultExpiration > 0) {
        const date = new Date()
        date.setMinutes(date.getMinutes() + linksConfig.defaultExpiration)
        finalExpiresAt = date.toISOString()
    }

    // 使用统一的密码处理
    const passwordResult = await processLinkPassword(passwordType || 'none', password || '')
    if (passwordResult.error) {
        return NextResponse.json({ error: passwordResult.error }, { status: 400 })
    }

    // 插入数据
    const { data, error } = await supabase
        .from('links')
        .insert([{
            original_url: url,
            slug: finalSlug,
            user_id: user?.id ?? null,
            user_email: user?.email ?? null,
            expires_at: finalExpiresAt,
            password_type: passwordType || 'none',
            password_hash: passwordResult.hash
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