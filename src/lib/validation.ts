import { toast } from "sonner"

/**
 * 验证 URL 格式
 * @param url - 要验证的 URL 字符串
 * @returns 如果有效返回 true，无效返回 false 并显示 toast 错误
 */
export function validateUrl(url: string): boolean {
    if (!url) {
        toast.error("请输入 URL", {
            description: "请输入需要缩短的 URL 地址"
        })
        return false
    }

    try {
        const urlObject = new URL(url)
        // 只允许 http 和 https 协议
        if (!['http:', 'https:'].includes(urlObject.protocol)) {
            toast.error("URL 格式错误", {
                description: "请输入以 http:// 或 https:// 开头的有效 URL"
            })
            return false
        }
        return true
    } catch (error) {
        toast.error("URL 格式错误", {
            description: "请输入以 http:// 或 https:// 开头的有效 URL"
        })
        return false
    }
}

/**
 * 验证自定义 Slug 格式
 * @param slug - 要验证的 slug 字符串
 * @returns 如果有效返回 true，无效返回 false 并显示 toast 错误
 */
export function validateSlug(slug: string): boolean {
    if (!slug) return true // slug 是可选的

    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        toast.error("后缀格式错误", {
            description: "自定义后缀只能包含字母、数字、连字符和下划线"
        })
        return false
    }
    return true
}
