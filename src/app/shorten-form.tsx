'use client'

import { useState } from 'react'
import { LoadingButton } from '@/components/ui/loading-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from "framer-motion"
import { CopyButton } from "@/components/copy-button"
import { ActionScale } from "@/components/action-scale"
import { cn } from "@/lib/utils"

export function ShortenForm() {
    const [url, setUrl] = useState('')
    const [shortUrlSlug, setShortUrlSlug] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{ url?: string }>({})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!url) {
            setErrors({ url: "请输入需要缩短的 URL" })
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            })
            const data = await res.json()

            if (data.slug) {
                setShortUrlSlug(data.slug)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid w-full items-center gap-4">
            <form onSubmit={handleSubmit} className="grid w-full items-center gap-4" noValidate>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="url" className={errors.url ? "text-red-500" : ""}>需要缩短的URL</Label>
                    <Input
                        id="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        // required // 移除 required
                        className={cn(errors.url && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.url && (
                        <span className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
                            {errors.url}
                        </span>
                    )}
                </div>
                <ActionScale>
                    <LoadingButton loading={loading} type="submit" className="w-full">
                        {loading ? '正在生成...' : '生成短链接'}
                    </LoadingButton>
                </ActionScale>
            </form>

            <AnimatePresence>
                {shortUrlSlug && (
                    <motion.div
                        // 初始：变小(0.8倍)，透明，向下位移
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        // 进场：恢复原状
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        // 离场：变小消失
                        exit={{ opacity: 0, scale: 0.9 }}
                        // 弹性配置：type: "spring" 会有那种 Q 弹的感觉
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}

                        className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md flex items-center justify-between"
                    >
                        <div className="flex flex-col">
                            <span className="text-xs text-green-600 uppercase font-bold">完成!</span>
                            <span className="font-medium text-sm">
                                {window.location.origin}/{shortUrlSlug}
                            </span>
                        </div>
                        <CopyButton slug={shortUrlSlug} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
