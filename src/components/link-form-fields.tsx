'use client'

import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link2, Wand2, ShieldCheck, Globe, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { getLinksSettings } from "@/app/dashboard/settings-actions"

interface LinkFormFieldsProps {
    url: string
    setUrl: (value: string) => void
    slug: string
    setSlug: (value: string) => void
    showCustomOption: boolean
    setShowCustomOption: (value: boolean) => void
    placeholderSlug?: string
    setPlaceholderSlug?: (value: string) => void
}

export function LinkFormFields({
    url,
    setUrl,
    slug,
    setSlug,
    showCustomOption,
    setShowCustomOption,
    placeholderSlug: externalPlaceholderSlug,
    setPlaceholderSlug: externalSetPlaceholderSlug
}: LinkFormFieldsProps) {
    // 内部状态：用于预览的 Host 和随机占位符
    const [host, setHost] = useState('')
    const [internalPlaceholderSlug, setInternalPlaceholderSlug] = useState('')

    // 使用外部状态或内部状态
    const placeholderSlug = externalPlaceholderSlug ?? internalPlaceholderSlug
    const setPlaceholderSlug = externalSetPlaceholderSlug ?? setInternalPlaceholderSlug

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHost(window.location.host)
        }
        // 从服务器获取配置的 slug 长度，然后生成对应长度的 placeholder
        async function fetchAndGeneratePlaceholder() {
            const settings = await getLinksSettings()
            const generated = nanoid(settings.slugLength)
            setPlaceholderSlug(generated)
        }
        fetchAndGeneratePlaceholder()
    }, [])

    return (
        <div className="grid gap-4">
            {/* --- URL 输入框 --- */}
            <div className="flex flex-col space-y-1.5 relative">
                <Label htmlFor="url">原始 URL</Label>
                <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="url"
                        name="url" // 方便 FormData 获取
                        type="url"
                        placeholder="https://very-long-url.com/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-9"
                        onFocus={() => setShowCustomOption(true)}
                        autoComplete="off"
                        data-1p-ignore
                    />
                </div>
            </div>

            {/* --- 高级选项区域 (动画 + 预览 + 输入) --- */}
            <AnimatePresence>
                {showCustomOption && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-1 pb-2 space-y-4">

                            {/* --- 预览卡片 --- */}
                            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>预览效果</span>
                                    {slug && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="flex items-center gap-1 text-purple-600 font-medium"
                                        >
                                            <Sparkles className="h-3 w-3" />
                                            开启自定义后缀
                                        </motion.div>
                                    )}
                                </div>

                                {/* Before: 原始长链接 */}
                                <div className="flex items-center gap-2 opacity-50 relative z-10">
                                    <div className="h-8 w-8 flex items-center justify-center rounded bg-muted shrink-0 shadow-sm border border-border/30">
                                        <Link2 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0 border-b border-dashed border-border h-8 flex items-center px-2">
                                        <p className="truncate text-sm text-muted-foreground w-full">
                                            {url || "https://very-long-url.com/..."}
                                        </p>
                                    </div>
                                </div>

                                {/* 连接线 */}
                                <div className="flex justify-start ml-4 -my-2 relative z-0">
                                    <div className="w-px h-6 bg-border/50" />
                                </div>

                                {/* After: 结果短链接 */}
                                <div className="flex items-center gap-2 relative z-10">
                                    <div className="h-8 w-8 flex items-center justify-center rounded bg-primary/10 shrink-0 ring-4 ring-background">
                                        <Globe className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0 bg-background border border-border rounded px-2 h-8 flex items-center shadow-sm">
                                        <p className="truncate text-sm font-medium text-foreground w-full">
                                            <span className="text-muted-foreground mr-0.5">{host || '...'} /</span>
                                            <span className={slug ? "text-purple-500 font-bold bg-purple-500/10 px-1 rounded" : "text-muted-foreground/50 italic font-normal"}>
                                                {slug || placeholderSlug || '...'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* --- 自定义后缀输入 --- */}
                            <div className="flex flex-col space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="slug" className="text-xs text-muted-foreground">
                                        自定义后缀 (可选)
                                    </Label>
                                </div>
                                <div className="relative">
                                    <Wand2 className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", slug ? "text-purple-500" : "text-muted-foreground")} />
                                    <Input
                                        id="slug"
                                        name="slug" // 方便 FormData 获取
                                        placeholder={placeholderSlug || "my-custom-name"}
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className={cn("pl-9 transition-colors", slug && "border-purple-200 focus-visible:ring-purple-500/20 bg-purple-50/30")}
                                        autoComplete="off"
                                        data-1p-ignore
                                        pattern="[a-zA-Z0-9_-]*"
                                        title="只允许字母、数字、连字符和下划线"
                                    />
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
