'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from "@/components/ui/switch"
import { Link2, Wand2, ShieldCheck, Globe, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// 提取工具函数
function generateRandomString(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

interface LinkFormFieldsProps {
    url: string
    setUrl: (value: string) => void
    slug: string
    setSlug: (value: string) => void
    isNoIndex: boolean
    setIsNoIndex: (value: boolean) => void
    showCustomOption: boolean
    setShowCustomOption: (value: boolean) => void
}

export function LinkFormFields({
    url,
    setUrl,
    slug,
    setSlug,
    isNoIndex,
    setIsNoIndex,
    showCustomOption,
    setShowCustomOption
}: LinkFormFieldsProps) {
    // 内部状态：用于预览的 Host 和随机占位符
    const [host, setHost] = useState('')
    const [placeholderSlug, setPlaceholderSlug] = useState('...')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHost(window.location.host)
        }
        setPlaceholderSlug(generateRandomString(6))
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
                        placeholder="https://example.com/very/long/path..."
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
                                            <span className={slug ? "text-purple-500 font-bold bg-purple-500/10 px-1 rounded" : "text-primary"}>
                                                {slug || (
                                                    <span className="text-muted-foreground/50 italic font-normal">{placeholderSlug}</span>
                                                )}
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
                                        placeholder="my-custom-name"
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

                            {/* --- 防索引开关 --- */}
                            <div className="flex flex-row items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-3 shadow-sm transition-colors hover:bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <ShieldCheck className={cn("h-4 w-4", isNoIndex ? "text-green-500" : "text-muted-foreground")} />
                                        屏蔽搜索引擎
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground">
                                        防止短链接被 Google/Bing 收录
                                    </p>
                                </div>
                                <Switch
                                    checked={isNoIndex}
                                    onCheckedChange={setIsNoIndex}
                                    className="data-[state=checked]:bg-green-500"
                                />
                                {/* 隐藏域：为了让 Server Actions 的 FormData 能拿到这个值 */}
                                <input type="hidden" name="isNoIndex" value={String(isNoIndex)} />
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
