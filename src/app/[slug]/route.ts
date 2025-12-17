import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase' // 确保这里引入的是你配置好的 supabase client

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
        // 2. ⚡️ 核心修改：调用刚才创建的 RPC 函数
        // 这里的 'increment_clicks' 对应数据库函数名
        // 这里的 'slug_param' 对应数据库函数的参数名

        // 注意：不要 await 它！让它在后台跑，以免拖慢跳转速度
        // (在 Serverless 环境下，为了稳妥可以用 waitUntil，但这里先简单处理)
        supabase.rpc('increment_clicks', { slug_param: slug }).then(({ error }) => {
            if (error) console.error('Error incrementing clicks:', error)
        })

        // 3. 跳转
        return NextResponse.redirect(data.original_url)
    }

    // 4. 没找到链接，跳回首页
    return NextResponse.redirect(new URL('/', request.url))
}