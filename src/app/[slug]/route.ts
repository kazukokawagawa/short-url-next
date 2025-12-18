import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params

    // 1. 查询长链接
    const { data } = await supabase
        .from('links')
        .select('original_url')
        .eq('slug', slug)
        .single()

    if (data?.original_url) {
        // 2. 异步更新点击数（不阻塞重定向）
        supabase.rpc('increment_clicks', { slug_param: slug }).then(({ error }) => {
            if (error) console.error('Error incrementing clicks:', error)
        })

        // 3. 301 永久重定向
        return NextResponse.redirect(data.original_url, { status: 301 })
    }

    // 4. 没找到链接，跳回首页
    return NextResponse.redirect(new URL('/', request.url))
}