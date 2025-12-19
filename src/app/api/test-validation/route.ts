import { NextResponse } from 'next/server'
import { validateUrl } from '@/lib/url-validation'
import { getSecurityConfig } from '@/lib/site-config'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const config = await getSecurityConfig()
    const result = await validateUrl(url, { logPrefix: '[Test]' })

    return NextResponse.json({
        suffix: config.blacklistSuffix,
        domain: config.blacklistDomain,
        valid: result.valid,
        error: result.error,
        errorCode: result.errorCode
    })
}
