import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // 如果有 next 参数，就跳去 next，否则跳去 dashboard
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // ✅ 关键修改：验证成功后，在跳转链接后加上 ?verified=true
            return NextResponse.redirect(`${origin}${next}?verified=true`)
        }
    }

    // 如果出错，跳转到错误页
    return NextResponse.redirect(`${origin}/login?message=Could not login with verified email`)
}
