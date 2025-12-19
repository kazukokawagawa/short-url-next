'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { getFriendlyErrorMessage } from "@/utils/error-mapping"
import { AnnouncementConfig } from "@/lib/site-config"

// 设置类型定义
export interface SiteSettings {
    name: string
    subtitle: string
    description: string
    keywords: string
    authorName: string
    authorUrl: string
    allowPublicShorten: boolean
    openRegistration: boolean
}

export interface LinksSettings {
    slugLength: number
    enableClickStats: boolean
    defaultExpiration?: number // 默认过期时间（分钟），0或undefined表示永不过期
}

export interface AppearanceSettings {
    primaryColor: string
    themeMode: 'light' | 'dark' | 'system'
    toastPosition: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
}

export interface DataSettings {
    autoCleanExpired: boolean
    expiredDays: number
}

export interface MaintenanceSettings {
    enabled: boolean
    message: string
}

export interface SecuritySettings {
    turnstileEnabled: boolean
    turnstileSiteKey: string
    turnstileSecretKey: string
    safeBrowsingEnabled: boolean
    safeBrowsingApiKey: string
    blacklistSuffix: string
    blacklistDomain: string
    skipAllChecks: boolean
}

export interface AllSettings {
    site: SiteSettings
    links: LinksSettings
    appearance: AppearanceSettings
    data: DataSettings
    maintenance: MaintenanceSettings
    security: SecuritySettings
    announcement: AnnouncementConfig
}

// 管理员删除链接 Action (不限制 user_id)
export async function adminDeleteLink(id: number) {
    const supabase = await createClient()

    // 1. 验证用户身份
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated", needsLogin: true }
    }

    // 2. 验证管理员权限
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: "Unauthorized: Admin access required" }
    }

    // 3. 执行删除 (不检查 user_id，管理员可以删除任何链接)
    const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: getFriendlyErrorMessage(error) }
    }

    revalidatePath('/admin/links')
    return { success: true }
}

// 获取所有设置
export async function getSettings(): Promise<{ data?: AllSettings, error?: string, needsLogin?: boolean }> {
    const supabase = await createClient()

    // 验证用户身份
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated", needsLogin: true }
    }

    // 验证管理员权限
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: "Unauthorized: Admin access required" }
    }

    // 读取所有设置
    const { data: settings, error } = await supabase
        .from('settings')
        .select('key, value')

    if (error) {
        return { error: getFriendlyErrorMessage(error) }
    }

    // 转换为对象格式
    const settingsMap: Record<string, any> = {}
    settings?.forEach(item => {
        settingsMap[item.key] = item.value
    })

    // 返回设置，使用默认值填充缺失项
    return {
        data: {
            site: settingsMap.site || {
                name: "LinkFlow",
                subtitle: "下一代短链接生成器",
                description: "让链接更短，让分享更简单",
                keywords: "短链接,URL Shortener,Link Management,Next.js",
                authorName: "池鱼",
                authorUrl: "https://chiyu.it",
                allowPublicShorten: true,
                openRegistration: true
            },
            links: settingsMap.links || { slugLength: 6, enableClickStats: true, defaultExpiration: 0 },
            appearance: settingsMap.appearance || {
                primaryColor: "#1a1a1f",
                themeMode: "system",
                toastPosition: "bottom-right"
            },
            data: settingsMap.data || { autoCleanExpired: false, expiredDays: 90 },
            maintenance: settingsMap.maintenance || { enabled: false, message: "" },
            security: settingsMap.security || {
                turnstileEnabled: false,
                turnstileSiteKey: "",
                turnstileSecretKey: "",
                safeBrowsingEnabled: false,
                safeBrowsingApiKey: "",
                blacklistSuffix: "",
                blacklistDomain: "",
                skipAllChecks: false
            },
            announcement: settingsMap.announcement || {
                enabled: false,
                content: "",
                type: "default",
                duration: 5000
            }
        }
    }
}

// 保存所有设置
export async function saveSettings(settings: AllSettings): Promise<{ success?: boolean, error?: string, needsLogin?: boolean }> {
    const supabase = await createClient()

    // 验证用户身份
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated", needsLogin: true }
    }

    // 验证管理员权限
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: "Unauthorized: Admin access required" }
    }

    // 逐个更新设置
    const updates = [
        { key: 'site', value: settings.site },
        { key: 'links', value: settings.links },
        { key: 'appearance', value: settings.appearance },
        { key: 'data', value: settings.data },
        { key: 'maintenance', value: settings.maintenance },
        { key: 'security', value: settings.security },
        { key: 'announcement', value: settings.announcement }
    ]

    for (const update of updates) {
        const { error } = await supabase
            .from('settings')
            .upsert(
                { key: update.key, value: update.value, updated_at: new Date().toISOString() },
                { onConflict: 'key' }
            )

        if (error) {
            return { error: getFriendlyErrorMessage(error) }
        }
    }

    revalidatePath('/admin/settings')
    return { success: true }
}

// 公开获取安全设置（不需要登录，不暴露 Secret Key）
export async function getPublicSecuritySettings(): Promise<{ enabled: boolean, siteKey: string }> {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')

    // 使用 service role key 读取设置（因为登录页面没有用户）
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('[getPublicSecuritySettings] No SUPABASE_SERVICE_ROLE_KEY')
        return { enabled: false, siteKey: '' }
    }

    const supabaseAdmin = createAdminClient(
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
        console.log('[getPublicSecuritySettings] Error:', error.message)
    }

    console.log('[getPublicSecuritySettings] Security setting from DB:', securitySetting?.value)

    if (!securitySetting?.value) {
        return { enabled: false, siteKey: '' }
    }

    const security = securitySetting.value as SecuritySettings
    const result = {
        enabled: security.turnstileEnabled,
        siteKey: security.turnstileSiteKey
    }
    console.log('[getPublicSecuritySettings] Returning:', result)
    return result
}

// 清理已过期链接
export async function cleanExpiredLinks() {
    const supabase = await createClient()

    // 1. 验证用户身份
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated", needsLogin: true }
    }

    // 2. 验证管理员权限
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: "Unauthorized: Admin access required" }
    }

    // 3. 执行清理
    const now = new Date().toISOString()
    const { error, count } = await supabase
        .from('links')
        .delete({ count: 'exact' })
        .not('expires_at', 'is', null) // expires_at is not null
        .lt('expires_at', now)         // expires_at < now

    if (error) {
        console.error('Error cleaning expired links:', error)
        return { error: getFriendlyErrorMessage(error) }
    }

    revalidatePath('/admin/settings')
    return { success: true, count }
}
