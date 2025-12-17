import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
    const { url, slug, isNoIndex } = await request.json()
    const supabase = await createClient()

    // 1. 检查登录状态
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    // 如果用户提供了 slug，就用用户的；否则生成一个新的
    const finalSlug = slug || nanoid(6)

    // 2. 插入数据
    const { data, error } = await supabase
        .from('links')
        .insert([{
            original_url: url,
            slug: finalSlug,
            user_id: user.id,
            is_no_index: isNoIndex !== undefined ? isNoIndex : true // 默认为 true
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