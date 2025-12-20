'use client'

import { motion, AnimatePresence } from "framer-motion"
import { LoaderCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContext } from "react"
import { LoadingContext } from "@/components/providers/loading-provider"

interface SmartLoadingProps {
    visible?: boolean
}

export function SmartLoading({ visible = true }: SmartLoadingProps) {
    // 安全地获取 context，如果没有 Provider 则使用默认值
    const context = useContext(LoadingContext)
    const message = context?.message ?? "正在加载..."
    const showContent = context?.showContent ?? false
    const showRefresh = context?.showRefresh ?? false

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <LoaderCircle className="h-8 w-8 text-muted-foreground opacity-50 animate-spin" />

            <div className="h-6 flex flex-col items-center">
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
}
