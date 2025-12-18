import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: any) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // 检查用户是否登录
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 核心逻辑：如果访问 /dashboard 且没登录，跳转去 /login
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. [新增] 管理员权限保护
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // 如果没登录，去登录页
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // 检查用户角色
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        // 🔍 调试日志 (会输出在 VSCode 的终端里)
        // console.log("----------------DEBUG----------------")
        // console.log("当前用户ID:", user.id)
        // console.log("查询结果 Profile:", profile)
        // console.log("查询错误 Error:", error)
        // console.log("-------------------------------------")

        // 如果不是 admin，踢回 dashboard
        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}