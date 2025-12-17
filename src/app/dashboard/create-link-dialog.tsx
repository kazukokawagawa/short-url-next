'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createLink } from "./actions"
import { toast } from "sonner"
import { ActionScale } from "@/components/action-scale"
import { cn } from "@/lib/utils"
import { SessionExpiredDialog } from "@/components/session-expired-dialog"
import { Link2, Wand2, ShieldCheck, Globe, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"

export function CreateLinkDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [slug, setSlug] = useState('')
    const [url, setUrl] = useState('')
    const [isNoIndex, setIsNoIndex] = useState(true)

    const [errors, setErrors] = useState<{ url?: string }>({})
    const [showSessionExpired, setShowSessionExpired] = useState(false)

    // ✨ Host for preview
    const [host, setHost] = useState('')
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHost(window.location.host)
        }
    }, [])

    // ✨ 新增：控制高级选项是否展开
    const [showCustomOption, setShowCustomOption] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})

        const formData = new FormData(e.currentTarget)
        formData.append('isNoIndex', isNoIndex.toString())

        const urlToCheck = formData.get('url') as string

        if (!urlToCheck) {
            setErrors({ url: "请输入 URL" })
            return
        }

        setLoading(true)

        const toastId = toast.loading("创建链接中...", {
            description: "正在检查 URL 可用性和安全性..."
        })

        try {
            const result = await createLink(formData)

            if (result?.needsLogin) {
                toast.dismiss(toastId)
                setLoading(false)
                setShowSessionExpired(true)
                return
            }

            setLoading(false)

            if (result?.error) {
                toast.error("无法创建链接", {
                    id: toastId,
                    description: result.error,
                })
            } else {
                toast.success("链接创建成功!", {
                    id: toastId,
                    description: "短链接已准备就绪，可以分享了。",
                })
                setOpen(false)
                // 重置状态
                setSlug('')
                setUrl('')
                setIsNoIndex(true)
                setShowCustomOption(false)
            }
        } catch (error) {
            setLoading(false)
            toast.error("网络错误", {
                id: toastId,
                description: "有一些东西坏了，过会再试试吧。"
            })
        }
    }

    // 当弹窗关闭时重置状态
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setShowCustomOption(false)
            setSlug('')
            setUrl('')
            setIsNoIndex(true)
            setErrors({})
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <ActionScale>
                    <Button>创建新的链接</Button>
                </ActionScale>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[425px]"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>创建新的链接</DialogTitle>
                    <DialogDescription>
                        在此创建你的短链接URL
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="grid gap-4 py-4" noValidate>
                    {/* --- 1. 主 URL 输入框 --- */}
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="url" className={cn(errors.url && "text-red-500")}>
                            原始 URL
                        </Label>
                        <div className="relative">
                            <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="url"
                                name="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className={cn("pl-9", errors.url && "border-red-500 focus-visible:ring-red-500")}
                                // ✨ 关键交互：获取焦点时展开下方
                                onFocus={() => setShowCustomOption(true)}
                                autoComplete="off"
                                data-1p-ignore
                            />
                        </div>
                        {errors.url && (
                            <span className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1 block">
                                {errors.url}
                            </span>
                        )}
                    </div>

                    {/* --- 2. 下浮出来的自定义选项 --- */}
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
                                    {/* --- ✨ Visual Preview Card --- */}
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

                                        {/* Before: Original URL */}
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

                                        {/* Timeline Connector */}
                                        <div className="flex justify-start ml-4 -my-2 relative z-0">
                                            <div className="w-px h-6 bg-border/50" />
                                        </div>

                                        {/* After: Short URL */}
                                        <div className="flex items-center gap-2 relative z-10">
                                            <div className="h-8 w-8 flex items-center justify-center rounded bg-primary/10 shrink-0 ring-4 ring-background">
                                                <Globe className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0 bg-background border border-border rounded px-2 h-8 flex items-center shadow-sm">
                                                <p className="truncate text-sm font-medium text-foreground w-full">
                                                    <span className="text-muted-foreground mr-0.5">{host || '...'} /</span>
                                                    <span className={slug ? "text-purple-500 font-bold bg-purple-500/10 px-1 rounded" : "text-primary"}>
                                                        {slug || (
                                                            <span className="text-muted-foreground/50 italic font-normal">random-string</span>
                                                        )}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 自定义后缀 */}
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="slug" className="text-xs text-muted-foreground">
                                                自定义后缀 (可选)
                                            </Label>
                                        </div>

                                        <div className="relative">
                                            <Wand2 className={cn("absolute left-3 top-3 h-4 w-4", slug ? "text-purple-500" : "text-muted-foreground")} />
                                            <Input
                                                id="slug"
                                                name="slug"
                                                placeholder="my-custom-name"
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                className={cn("pl-9 transition-colors", slug && "border-purple-200 focus-visible:ring-purple-500/20 bg-purple-50/30")}
                                                autoComplete="off"
                                                data-1p-ignore
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground pl-1">
                                            预览: {typeof window !== 'undefined' ? window.location.host : '...'} / <span className="font-medium text-foreground">{slug || '...'}</span>
                                        </p>
                                    </div>

                                    {/* --- ✨ 防索引开关 (颜色优化) --- */}
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

                    <DialogFooter>
                        <ActionScale>
                            <LoadingButton loading={loading} type="submit" className="w-full">保存更改</LoadingButton>
                        </ActionScale>
                    </DialogFooter>
                </form>
            </DialogContent>

            <SessionExpiredDialog
                open={showSessionExpired}
                onOpenChange={setShowSessionExpired}
            />
        </Dialog>
    )
}