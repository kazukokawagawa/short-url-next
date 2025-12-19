import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface TurnstileVerifyResponse {
    success: boolean
    'error-codes'?: string[]
    challenge_ts?: string
    hostname?: string
}

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Token is required' },
                { status: 400 }
            )
        }

        // 从数据库获取 Secret Key
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json(
                { success: false, error: 'Server configuration error' },
                { status: 500 }
            )
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const { data: securitySetting } = await supabaseAdmin
            .from('settings')
            .select('value')
            .eq('key', 'security')
            .single()

        if (!securitySetting?.value?.turnstileSecretKey) {
            return NextResponse.json(
                { success: false, error: 'Turnstile not configured' },
                { status: 500 }
            )
        }

        const secretKey = securitySetting.value.turnstileSecretKey

        // 调用 Cloudflare Turnstile API 验证 token
        const formData = new URLSearchParams()
        formData.append('secret', secretKey)
        formData.append('response', token)

        // 获取客户端 IP（可选）
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        if (ip) {
            formData.append('remoteip', ip)
        }

        const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            }
        )

        const verifyResult: TurnstileVerifyResponse = await verifyResponse.json()

        if (verifyResult.success) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Verification failed',
                    codes: verifyResult['error-codes']
                },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Turnstile verification error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
