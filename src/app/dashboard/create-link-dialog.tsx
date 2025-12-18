'use client'

import { useState } from "react"
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
import { createLink } from "./actions"
import { toast } from "sonner"
import { validateUrl, validateSlug } from '@/lib/validation'
import { ActionScale } from "@/components/action-scale"
import { SessionExpiredDialog } from "@/components/session-expired-dialog"
import { LinkFormFields } from '@/components/link-form-fields' // 引入新组件
import { Plus } from "lucide-react"
import { SaveCheckIcon } from "@/components/save-check-icon"

export function CreateLinkDialog({ onSuccess }: { onSuccess?: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // 状态管理
    const [url, setUrl] = useState('')
    const [slug, setSlug] = useState('')
    const [isNoIndex, setIsNoIndex] = useState(true)
    const [showCustomOption, setShowCustomOption] = useState(false)

    const [showSessionExpired, setShowSessionExpired] = useState(false)
    const [isButtonHovered, setIsButtonHovered] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        // 手动构造 FormData 以确保状态同步（虽然 form 里有 name 属性，但 React 状态控制更稳）
        const formData = new FormData(e.currentTarget)
        // 注意：Checkbox/Switch 如果没勾选可能不会传值，这里 LinkFormFields 里已经加了 hidden input 处理

        // 验证 URL 和 Slug
        const urlToCheck = formData.get('url') as string
        const slugToCheck = formData.get('slug') as string

        if (!validateUrl(urlToCheck) || !validateSlug(slugToCheck)) {
            return
        }

        setLoading(true)
        const toastId = toast.loading("创建链接中...", { description: "正在检查 URL 可用性和安全性..." })

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
                toast.error("无法创建链接", { id: toastId, description: result.error })
            } else {
                toast.success("链接创建成功!", { id: toastId, description: "短链接已准备就绪。" })
                setOpen(false)
                handleOpenChange(false) // 彻底重置
                // 调用刷新回调而不是整页刷新
                if (onSuccess) {
                    onSuccess()
                }
            }
        } catch (error) {
            setLoading(false)
            toast.error("网络错误", { id: toastId })
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setShowCustomOption(false)
            setSlug('')
            setUrl('')
            setIsNoIndex(true)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <ActionScale>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        创建新的链接
                    </Button>
                </ActionScale>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>创建新的链接</DialogTitle>
                    <DialogDescription>在此创建你的短链接URL</DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="grid gap-4 py-4" noValidate>

                    {/* 核心字段组件 */}
                    <LinkFormFields
                        url={url}
                        setUrl={setUrl}
                        slug={slug}
                        setSlug={setSlug}
                        isNoIndex={isNoIndex}
                        setIsNoIndex={setIsNoIndex}
                        showCustomOption={showCustomOption}
                        setShowCustomOption={setShowCustomOption}
                    />

                    <DialogFooter>
                        <ActionScale
                            onMouseEnter={() => setIsButtonHovered(true)}
                            onMouseLeave={() => setIsButtonHovered(false)}
                        >
                            <LoadingButton
                                loading={loading}
                                type="submit"
                                className="w-full"
                                icon={<SaveCheckIcon isHovered={isButtonHovered} />}
                            >
                                保存更改
                            </LoadingButton>
                        </ActionScale>
                    </DialogFooter>
                </form>
            </DialogContent>

            <SessionExpiredDialog open={showSessionExpired} onOpenChange={setShowSessionExpired} />
        </Dialog>
    )
}