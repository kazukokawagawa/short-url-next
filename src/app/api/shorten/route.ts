import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
    const { url } = await request.json()

    // 1. 简单校验
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    // 2. 生成短码 (取前6位即可)
    const slug = nanoid(6)

    // 3. 存入 Supabase
    const { data, error } = await supabase
        .from('links')
        .insert([{ original_url: url, slug: slug }])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ slug: data.slug, original_url: data.original_url })
}