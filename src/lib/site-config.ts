'use server'

import { createClient } from "@/utils/supabase/server"

// 站点设置类型
export interface SiteConfig {
    name: string
    subtitle: string
    description: string
    keywords: string
    authorName: string
    authorUrl: string
    allowPublicShorten: boolean
}

// 默认设置（用于数据库未配置时）
const defaultSiteConfig: SiteConfig = {
    name: "LinkFlow",
    subtitle: "下一代短链接生成器",
    description: "让链接更短，让分享更简单",
    keywords: "短链接,URL Shortener,Link Management,Next.js",
    authorName: "池鱼",
    authorUrl: "https://chiyu.it",
    allowPublicShorten: true
}

// 获取站点配置（用于服务端组件和 Server Actions）
export async function getSiteConfig(): Promise<SiteConfig> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'site')
            .single()

        if (error || !data) {
            return defaultSiteConfig
        }

        return {
            ...defaultSiteConfig,
            ...data.value
        }
    } catch {
        return defaultSiteConfig
    }
}

// 别名，保持兼容性
export const getCachedSiteConfig = getSiteConfig

// 外观设置类型
export interface AppearanceConfig {
    primaryColor: string
    themeMode: 'light' | 'dark' | 'system'
}

// 默认外观设置
const defaultAppearanceConfig: AppearanceConfig = {
    primaryColor: "#1a1a1f",
    themeMode: "system"
}

// 获取外观配置（用于服务端组件）
export async function getAppearanceConfig(): Promise<AppearanceConfig> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'appearance')
            .single()

        if (error || !data) {
            return defaultAppearanceConfig
        }

        return {
            ...defaultAppearanceConfig,
            ...data.value
        }
    } catch {
        return defaultAppearanceConfig
    }
}
