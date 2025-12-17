import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server' // 改用我们封装的服务端客户端
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
    const { url } = await request.json()
    const supabase = await createClient()

    // 1. 检查登录状态
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    const slug = nanoid(6)

    // 2. 插入数据 (Supabase 会根据 RLS 自动关联 user_id)
    const { data, error } = await supabase
        .from('links')
        .insert([{
            original_url: url,
            slug: slug,
            user_id: user.id // 显式加上更保险
        }])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ slug: data.slug, original_url: data.original_url })
}