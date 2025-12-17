import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug

    // 1. 查询数据库
    const { data } = await supabase
        .from('links')
        .select('original_url')
        .eq('slug', slug)
        .single()

    if (data?.original_url) {
        // 2. (可选) 异步增加点击计数，不阻塞跳转
        // 注意：在 Serverless 环境下，不await可能会被过早杀掉进程，
        // 生产环境建议使用 Next.js 的 waitUntil 或者队列，这里简化处理。
        await supabase.rpc('increment_clicks', { row_slug: slug }) // 需要在数据库写个RPC函数，或者简单用update

        // 3. 307 临时重定向 或 301 永久重定向
        return NextResponse.redirect(data.original_url)
    }

    // 4. 没找到则跳转回首页或404
    return NextResponse.redirect(new URL('/', request.url))
}