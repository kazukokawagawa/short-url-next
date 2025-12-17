'use client'

import { useState, useEffect } from 'react' // 1. 引入 useEffect
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from "@/components/ui/switch"
import { CopyButton } from '@/components/copy-button'
import { toast } from "sonner"
// 2. 引入新图标：ArrowDown (转换箭头), Globe (代表浏览器), Sparkles (代表魔法效果)
import { Loader2, Link2, Wand2, ShieldCheck, ArrowDown, Globe, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { User } from '@supabase/supabase-js'
import { cn } from "@/lib/utils"

export function ShortenForm({ user }: { user: User | null }) {
    const router = useRouter()
    const [url, setUrl] = useState('')
    const [slug, setSlug] = useState('')
    const [isNoIndex, setIsNoIndex] = useState(true)

    const [shortUrlSlug, setShortUrlSlug] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{ url?: string }>({})

    const [showCustomOption, setShowCustomOption] = useState(false)

    // 3. 新增：获取当前域名，用于预览显示
    const [host, setHost] = useState('')
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 去掉 http/https 前缀，只留域名，看起来更像浏览器地址栏
            setHost(window.location.host)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!user) {
            toast("需要登录", {
                description: "你需要登录以创建短链接",
                action: {
                    label: "登录",
                    onClick: () => router.push('/login')
                },
            })
            return
        }

        if (!url) {
            setErrors({ url: "请输入需要缩短的 URL" })
            return
        }

        setLoading(true)
        setShortUrlSlug('')

        try {
            const res = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, slug, isNoIndex }),
            })
            const data = await res.json()

            if (data.slug) {
                setShortUrlSlug(data.slug)
                setUrl('')
                setSlug('')
                setIsNoIndex(true)
                setShowCustomOption(false)
                toast.success("链接创建成功!")
            } else {
                toast.error("错误", { description: data.error || "生成失败" })
            }
        } catch (error) {
            console.error(error)
            toast.error("网络错误")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="grid w-full items-center gap-4">

                {/* --- 第一行：URL 输入框 --- */}
                <div className="flex flex-col space-y-1.5 relative">
                    <Label htmlFor="url" className={errors.url ? "text-red-500" : ""}>原始 URL</Label>
                    <div className="relative">
                        <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="url"
                            placeholder="https://example.com/very/long/path..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className={cn("pl-9", errors.url && "border-red-500 focus-visible:ring-red-500")}
                            onFocus={() => setShowCustomOption(true)}
                        />
                    </div>
                    {errors.url && (
                        <span className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1 block">
                            {errors.url}
                        </span>
                    )}
                </div>

                {/* --- 下浮的高级选项区域 --- */}
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

                                {/* --- ✨ 新增：可视化预览卡片 --- */}
                                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                        <span>预览效果</span>
                                        {/* 如果用户填了 slug，显示个“魔法生效”的小动画 */}
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

                                    {/* 转换连接线 - 替换箭头 */}
                                    <div className="flex justify-start ml-4 -my-2 relative z-0">
                                        <div className="w-px h-6 bg-border/50" />
                                    </div>

                                    {/* After: 结果短链接 (高亮显示) */}
                                    <div className="flex items-center gap-2 relative z-10">
                                        <div className="h-8 w-8 flex items-center justify-center rounded bg-primary/10 shrink-0 ring-4 ring-background">
                                            <Globe className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0 bg-background border border-border rounded px-2 h-8 flex items-center shadow-sm">
                                            <p className="truncate text-sm font-medium text-foreground w-full">
                                                <span className="text-muted-foreground mr-0.5">{host || '...'} /</span>
                                                {/* 重点高亮 Slug 部分 */}
                                                <span className={slug ? "text-purple-500 font-bold bg-purple-500/10 px-1 rounded" : "text-primary"}>
                                                    {slug || (
                                                        <span className="text-muted-foreground/50 italic font-normal">random-string</span>
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* --- 第二行：自定义后缀 (保持不变) --- */}
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="slug" className="text-xs text-muted-foreground">
                                            自定义后缀 (可选)
                                        </Label>
                                    </div>
                                    <div className="relative">
                                        <Wand2 className={cn("absolute left-3 top-3 h-4 w-4", slug ? "text-purple-500" : "text-muted-foreground")} />
                                        <Input
                                            id="slug"
                                            placeholder="my-custom-name"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className={cn("pl-9 transition-colors", slug && "border-purple-200 focus-visible:ring-purple-500/20 bg-purple-50/30")}
                                        />
                                    </div>
                                </div>

                                {/* --- ✨ 第三行：防索引开关 (保持绿色风格) --- */}
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
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button disabled={loading} type="submit" className="w-full">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            生成中...
                        </>
                    ) : '生成短链接'}
                </Button>
            </form>

            {/* --- 结果显示 --- */}
            <AnimatePresence>
                {shortUrlSlug && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md flex items-center justify-between"
                    >
                        <div className="flex flex-col">
                            <span className="text-xs text-green-600 uppercase font-bold">Success!</span>
                            <span className="font-medium text-sm">
                                {typeof window !== 'undefined' ? window.location.host : ''}/{shortUrlSlug}
                            </span>
                        </div>
                        <CopyButton slug={shortUrlSlug} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
