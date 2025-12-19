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
import { toastMessages, validateUrl, validateSlug } from '@/lib/validation'
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
    const [showCustomOption, setShowCustomOption] = useState(false)
    const [placeholderSlug, setPlaceholderSlug] = useState('')

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
        const toastId = toastMessages.linkCreating()

        // 如果用户没有输入 slug，使用 placeholder（现在 placeholder 长度已与服务器配置一致）
        const finalSlug = slugToCheck || placeholderSlug
        if (finalSlug && !slugToCheck) {
            formData.set('slug', finalSlug)
        }

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
                // 根据错误类型显示不同的 toast
                if (result.error === 'URL_NOT_ACCESSIBLE') {
                    toastMessages.urlNotAccessible((result as { statusCode?: number }).statusCode)
                    toast.dismiss(toastId)
                } else if (result.error === 'URL_TIMEOUT') {
                    toastMessages.urlTimeout()
                    toast.dismiss(toastId)
                } else if (result.error === 'URL_VERIFICATION_FAILED') {
                    toastMessages.urlVerificationFailed()
                    toast.dismiss(toastId)
                } else if (result.error === 'URL_MALICIOUS') {
                    toastMessages.urlMalicious((result as { threats?: string[] }).threats)
                    toast.dismiss(toastId)
                } else {
                    toastMessages.linkCreateError(result.error, toastId)
                }
            } else {
                toastMessages.linkCreateSuccess(toastId)

                // 先调用刷新回调
                if (onSuccess) {
                    onSuccess()
                }

                // 再关闭对话框
                setOpen(false)
                handleOpenChange(false) // 彻底重置
            }
        } catch (error) {
            setLoading(false)
            toastMessages.networkError(toastId)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setShowCustomOption(false)
            setSlug('')
            setUrl('')
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
                        showCustomOption={showCustomOption}
                        setShowCustomOption={setShowCustomOption}
                        placeholderSlug={placeholderSlug}
                        setPlaceholderSlug={setPlaceholderSlug}
                    />

                    <DialogFooter>
                        <ActionScale
                            onMouseEnter={() => setIsButtonHovered(true)}
                            onMouseLeave={() => setIsButtonHovered(false)}
                            onTouchStart={() => setIsButtonHovered(true)}
                            onTouchEnd={() => setIsButtonHovered(false)}
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