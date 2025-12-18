'use server'

import { createClient } from "@/utils/supabase/server"

/**
 * 获取链接设置（可公开调用，用于客户端获取 slugLength）
 */
export async function getLinksSettings() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'links')
        .single()

    if (error || !data) {
        // 返回默认值
        return {
            slugLength: 6,
            enableClickStats: true
        }
    }

    return {
        slugLength: data.value?.slugLength ?? 6,
        enableClickStats: data.value?.enableClickStats ?? true
    }
}

/**
 * 获取站点设置（包含 allowPublicShorten）
 */
export async function getSiteSettings() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'site')
        .single()

    // 🔍 调试日志
    console.log('--- getSiteSettings Debug ---')
    console.log('error:', error)
    console.log('data:', JSON.stringify(data))
    console.log('allowPublicShorten:', data?.value?.allowPublicShorten)
    console.log('-----------------------------')

    if (error || !data) {
        // 返回默认值（与管理后台默认值一致）
        return {
            allowPublicShorten: true
        }
    }

    return {
        allowPublicShorten: data.value?.allowPublicShorten ?? true
    }
}
