'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { generatePrimaryColors, generateDarkModePrimaryColors } from '@/lib/color-utils'

interface ThemeColorProviderProps {
    primaryColor: string
}

/**
 * 主题色应用组件
 * 接收服务端传递的主题色并根据当前主题模式应用到 CSS 变量
 */
export function ThemeColorProvider({ primaryColor }: ThemeColorProviderProps) {
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        if (primaryColor) {
            const isDark = resolvedTheme === 'dark'
            const colors = isDark
                ? generateDarkModePrimaryColors(primaryColor)
                : generatePrimaryColors(primaryColor)

            // 应用主题色到 CSS 变量
            document.documentElement.style.setProperty('--primary', colors.primary)
            document.documentElement.style.setProperty('--primary-foreground', colors.primaryForeground)

            // 同时应用到侧边栏
            document.documentElement.style.setProperty('--sidebar-primary', colors.primary)
            document.documentElement.style.setProperty('--sidebar-primary-foreground', colors.primaryForeground)
        }
    }, [primaryColor, resolvedTheme])

    return null
}
