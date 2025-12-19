'use client'

import { motion, AnimatePresence } from "framer-motion"
import { LoaderCircle, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"

export function SmartLoading() {
    const [message, setMessage] = useState<string>("")
    const [showContent, setShowContent] = useState(false)
    const [showRefresh, setShowRefresh] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // 0-1s: Empty (managed by showContent)
        const t1 = setTimeout(() => {
            setShowContent(true)
            setMessage("正在加载...")
        }, 1000)

        const t2 = setTimeout(() => {
            setMessage("仍在加载...")
        }, 3000)

        const t3 = setTimeout(() => {
            setMessage("就快好了...")
        }, 6000)

        const t4 = setTimeout(() => {
            setMessage("再等等呗...")
        }, 10000)

        const t5 = setTimeout(() => {
            setMessage("即将完成...")
        }, 14000)

        const t6 = setTimeout(() => {
            setMessage("x_x")
            setShowRefresh(true)
        }, 18000)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
            clearTimeout(t4)
            clearTimeout(t5)
            clearTimeout(t6)
        }
    }, [])

    const content = (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <LoaderCircle className="h-8 w-8 text-muted-foreground opacity-50" />
            </motion.div>

            <div className="h-6 flex flex-col items-center"> {/* 固定高度防止文字跳动 */}
                <AnimatePresence mode="wait">
                    {showContent && (
                        <motion.p
                            key={message}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-muted-foreground text-center"
                        >
                            {message}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showRefresh && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                    >
                        <Button
                            variant="default"
                            size="default"
                            className="gap-2 shadow-lg"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="h-4 w-4" />
                            刷新页面
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )

    // 在服务端渲染时或未挂载时渲染普通fixed div (可能会被template限制，但好过没有)
    // 客户端挂载后使用Portal渲染到body
    if (!mounted) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background">
                <LoaderCircle className="h-8 w-8 text-muted-foreground opacity-50 animate-spin" />
            </div>
        )
    }

    return createPortal(content, document.body)
}
