'use server'

/**
 * Google Safe Browsing API v4 Lookup
 * 检测 URL 是否为恶意网址
 * 
 * 支持检测的威胁类型：
 * - MALWARE: 恶意软件
 * - SOCIAL_ENGINEERING: 社会工程/钓鱼
 * - UNWANTED_SOFTWARE: 不需要的软件
 * - POTENTIALLY_HARMFUL_APPLICATION: 潜在有害应用
 */

interface ThreatMatch {
    threatType: string
    platformType: string
    threat: { url: string }
    cacheDuration: string
    threatEntryType: string
}

interface SafeBrowsingResponse {
    matches?: ThreatMatch[]
}

export interface SafeBrowsingResult {
    isSafe: boolean
    threats?: string[]
    error?: string
}

// 威胁类型映射（用于友好显示）
const THREAT_TYPE_MAP: Record<string, string> = {
    'MALWARE': '恶意软件',
    'SOCIAL_ENGINEERING': '钓鱼/社会工程攻击',
    'UNWANTED_SOFTWARE': '不需要的软件',
    'POTENTIALLY_HARMFUL_APPLICATION': '潜在有害应用'
}

/**
 * 使用 Google Safe Browsing API v4 检测 URL 安全性
 * 
 * @param url - 要检测的 URL
 * @param apiKey - Google API Key
 * @returns SafeBrowsingResult - 包含 isSafe 和可能的威胁列表
 */
export async function checkUrlSafety(url: string, apiKey: string): Promise<SafeBrowsingResult> {
    console.log('[Safe Browsing] ========== 开始检测 ==========')
    console.log('[Safe Browsing] 检测 URL:', url)
    console.log('[Safe Browsing] API Key 已配置:', apiKey ? `是 (长度: ${apiKey.length})` : '否')

    if (!apiKey) {
        console.log('[Safe Browsing] 跳过检测: API Key 未配置')
        return { isSafe: true, error: 'API Key 未配置' }
    }

    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`

    const requestBody = {
        client: {
            clientId: "short-url-next",
            clientVersion: "1.0.0"
        },
        threatInfo: {
            threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
        }
    }

    console.log('[Safe Browsing] 发送 API 请求...')

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        console.log('[Safe Browsing] API 响应状态:', response.status, response.statusText)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[Safe Browsing] API 请求失败:', response.status, response.statusText)
            console.error('[Safe Browsing] 错误详情:', errorText)
            // API 错误时 fallback 为安全，避免阻塞正常链接创建
            return { isSafe: true, error: `API 请求失败: ${response.status}` }
        }

        const data: SafeBrowsingResponse = await response.json()
        console.log('[Safe Browsing] API 响应数据:', JSON.stringify(data))

        // 如果有匹配项，说明 URL 不安全
        if (data.matches && data.matches.length > 0) {
            const threats = data.matches.map(match =>
                THREAT_TYPE_MAP[match.threatType] || match.threatType
            )
            console.log('[Safe Browsing] ⚠️ 检测到威胁:', threats)
            console.log('[Safe Browsing] ========== 检测完成 (不安全) ==========')
            return {
                isSafe: false,
                threats: [...new Set(threats)] // 去重
            }
        }

        // 没有匹配项，URL 是安全的
        console.log('[Safe Browsing] ✅ URL 安全，未检测到威胁')
        console.log('[Safe Browsing] ========== 检测完成 (安全) ==========')
        return { isSafe: true }

    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('[Safe Browsing] API 请求超时')
            // 超时时 fallback 为安全
            return { isSafe: true, error: 'API 请求超时' }
        }

        console.error('[Safe Browsing] API 调用异常:', error)
        // 其他错误也 fallback 为安全
        return { isSafe: true, error: '检测服务暂时不可用' }
    }
}

/**
 * 获取 Safe Browsing 配置（从数据库）
 * 仅供服务端使用
 */
export async function getSafeBrowsingConfig(): Promise<{ enabled: boolean; apiKey: string }> {
    console.log('[Safe Browsing Config] 获取配置...')

    const { createClient } = await import('@supabase/supabase-js')

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('[Safe Browsing Config] 缺少 SUPABASE_SERVICE_ROLE_KEY 环境变量')
        return { enabled: false, apiKey: '' }
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

    const { data: securitySetting, error } = await supabaseAdmin
        .from('settings')
        .select('value')
        .eq('key', 'security')
        .single()

    if (error) {
        console.log('[Safe Browsing Config] 数据库查询错误:', error.message)
        return { enabled: false, apiKey: '' }
    }

    if (!securitySetting?.value) {
        console.log('[Safe Browsing Config] 没有找到 security 设置记录')
        return { enabled: false, apiKey: '' }
    }

    console.log('[Safe Browsing Config] 原始设置数据:', JSON.stringify(securitySetting.value))

    const security = securitySetting.value as {
        safeBrowsingEnabled?: boolean
        safeBrowsingApiKey?: string
    }

    const result = {
        enabled: security.safeBrowsingEnabled ?? false,
        apiKey: security.safeBrowsingApiKey ?? ''
    }

    console.log('[Safe Browsing Config] 解析结果:', {
        enabled: result.enabled,
        apiKeyLength: result.apiKey ? result.apiKey.length : 0
    })

    return result
}
