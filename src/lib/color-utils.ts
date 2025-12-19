/**
 * 颜色转换工具 - HEX 到 OKLCH
 */

/**
 * 将 HEX 颜色转换为 OKLCH 格式
 * @param hex - HEX 颜色值，如 "#7c3aed"
 * @returns OKLCH 格式字符串，如 "oklch(0.5 0.2 290)"
 */
export function hexToOklch(hex: string): string {
    // 移除 # 前缀
    const cleanHex = hex.replace('#', '')

    // 解析 RGB 值
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255

    // sRGB 到线性 RGB
    const linearR = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
    const linearG = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
    const linearB = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

    // 线性 RGB 到 XYZ
    const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB
    const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.0721750 * linearB
    const z = 0.0193339 * linearR + 0.1191920 * linearG + 0.9503041 * linearB

    // XYZ 到 LMS
    const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z
    const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z
    const s = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z

    // LMS 的立方根
    const lRoot = Math.cbrt(l)
    const mRoot = Math.cbrt(m)
    const sRoot = Math.cbrt(s)

    // LMS 到 Oklab
    const labL = 0.2104542553 * lRoot + 0.7936177850 * mRoot - 0.0040720468 * sRoot
    const labA = 1.9779984951 * lRoot - 2.4285922050 * mRoot + 0.4505937099 * sRoot
    const labB = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.8086757660 * sRoot

    // Oklab 到 Oklch
    const C = Math.sqrt(labA * labA + labB * labB)
    let H = Math.atan2(labB, labA) * (180 / Math.PI)
    if (H < 0) H += 360

    // 格式化输出
    const L = Math.round(labL * 1000) / 1000
    const chroma = Math.round(C * 1000) / 1000
    const hue = Math.round(H * 1000) / 1000

    return `oklch(${L} ${chroma} ${hue})`
}

/**
 * 生成主题色相关的 CSS 变量
 * @param primaryHex - 主题色 HEX 值
 * @returns 包含 primary 和 primary-foreground 的对象
 */
export function generatePrimaryColors(primaryHex: string): {
    primary: string
    primaryForeground: string
} {
    const primaryOklch = hexToOklch(primaryHex)

    // 解析 oklch 值来决定前景色
    const match = primaryOklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
    const lightness = match ? parseFloat(match[1]) : 0.5

    // 如果主题色较亮，使用深色前景；否则使用浅色前景
    const foregroundOklch = lightness > 0.6
        ? 'oklch(0.21 0.006 285.885)'  // 深色前景
        : 'oklch(0.985 0 0)'            // 浅色前景

    return {
        primary: primaryOklch,
        primaryForeground: foregroundOklch
    }
}

/**
 * 为深色模式生成主题色
 * 将亮度反转，确保在深色背景下可见
 * @param primaryHex - 主题色 HEX 值
 */
export function generateDarkModePrimaryColors(primaryHex: string): {
    primary: string
    primaryForeground: string
} {
    const primaryOklch = hexToOklch(primaryHex)

    // 解析 oklch 值
    const match = primaryOklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
    const lightness = match ? parseFloat(match[1]) : 0.5
    const chroma = match ? parseFloat(match[2]) : 0
    const hue = match ? parseFloat(match[3]) : 0

    // 对于深色模式，如果主题色太暗，则使用反转亮度
    // 确保在深色背景下文字可见
    let darkPrimary: string
    if (lightness < 0.5) {
        // 深色主题色 -> 在深色模式下使用高亮度版本
        const invertedLightness = Math.max(0.85, 1 - lightness)
        darkPrimary = `oklch(${invertedLightness} ${chroma} ${hue})`
    } else {
        // 浅色主题色可以直接使用
        darkPrimary = primaryOklch
    }

    // 深色模式下前景色：如果主色较亮用深色，否则用浅色
    const darkForeground = lightness > 0.6
        ? 'oklch(0.21 0.006 285.885)'  // 深色前景
        : 'oklch(0.21 0.006 285.885)'  // 深色前景（因为背景已反转为亮色）

    return {
        primary: darkPrimary,
        primaryForeground: darkForeground
    }
}
