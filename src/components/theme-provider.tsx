"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

// 主题切换过渡效果钩子
function useThemeTransition() {
    const { resolvedTheme } = useTheme()
    const prevThemeRef = React.useRef(resolvedTheme)

    React.useEffect(() => {
        if (prevThemeRef.current !== resolvedTheme && prevThemeRef.current !== undefined) {
            // 添加过渡类
            document.documentElement.classList.add('theme-transitioning')

            // 过渡结束后移除
            const timer = setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning')
            }, 300)

            return () => clearTimeout(timer)
        }
        prevThemeRef.current = resolvedTheme
    }, [resolvedTheme])
}

// 内部组件用于挂载过渡钩子
function ThemeTransitionHandler({ children }: { children: React.ReactNode }) {
    useThemeTransition()
    return <>{children}</>
}

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider {...props}>
            <ThemeTransitionHandler>
                {children}
            </ThemeTransitionHandler>
        </NextThemesProvider>
    )
}
