"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { ActionScale } from "@/components/action-scale"
import { motion, AnimatePresence } from "framer-motion"

export function CopyButton({ slug }: { slug: string }) {
    const [hasCopied, setHasCopied] = useState(false)

    const onCopy = async () => {
        const fullUrl = `${window.location.origin}/${slug}`

        try {
            // 优先使用现代 Clipboard API
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(fullUrl)
            } else {
                // Fallback: 使用传统方法
                const textArea = document.createElement('textarea')
                textArea.value = fullUrl
                textArea.style.position = 'fixed'
                textArea.style.opacity = '0'
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
            }
            setHasCopied(true)
            setTimeout(() => setHasCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <ActionScale>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 relative"
                onClick={onCopy}
            >
                <span className="sr-only">Copy</span>
                {/* 使用 AnimatePresence 实现淡入淡出动画 */}
                <AnimatePresence mode="wait">
                    {hasCopied ? (
                        <motion.div
                            key="check"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Check className="h-4 w-4 text-green-500" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="copy"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Copy className="h-4 w-4 text-gray-500" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>
        </ActionScale>
    )
}