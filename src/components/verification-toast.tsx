'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export function VerificationToast() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // 检测 URL 中是否有 verified=true
        const isVerified = searchParams.get('verified') === 'true'
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (isVerified) {
            // 🎉 弹出成功提示
            toast.success("邮箱验证成功！", {
                description: "您的账户已激活，欢迎使用。",
                duration: 5000, // 显示久一点
            })

            // 🧹 清理 URL：把 ?verified=true 去掉，看着更干净，也防止刷新页面重复弹窗
            const params = new URLSearchParams(searchParams.toString())
            params.delete('verified')
            router.replace(`${pathname}?${params.toString()}`)
        }

        // (可选) 处理错误情况
        if (error) {
            toast.error("验证失败", {
                description: errorDescription || "链接可能已过期或无效。",
            })
        }
    }, [searchParams, router, pathname])

    // 这个组件不需要渲染任何 UI，它只负责逻辑
    return null
}
