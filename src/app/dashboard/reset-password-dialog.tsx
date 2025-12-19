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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { updateLinkPassword } from "./actions"
import { toast } from "sonner"
import { SessionExpiredDialog } from "@/components/session-expired-dialog"
import { Lock, ShieldOff, KeyRound, Hash } from "lucide-react"

type PasswordType = 'none' | 'six_digit' | 'custom'

interface ResetPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    linkId: number
    currentPasswordType: string | null | undefined
    onSuccess?: () => void
}

export function ResetPasswordDialog({
    open,
    onOpenChange,
    linkId,
    currentPasswordType,
    onSuccess
}: ResetPasswordDialogProps) {
    const [loading, setLoading] = useState(false)
    const [passwordType, setPasswordType] = useState<PasswordType>(
        (currentPasswordType as PasswordType) || 'none'
    )
    const [password, setPassword] = useState('')
    const [showSessionExpired, setShowSessionExpired] = useState(false)

    const handleSubmit = async () => {
        // 验证
        if (passwordType === 'six_digit' && password.length !== 6) {
            toast.warning('请输入完整的6位数字密码')
            return
        }
        if (passwordType === 'custom' && password.length === 0) {
            toast.warning('请输入自定义口令')
            return
        }

        setLoading(true)
        const result = await updateLinkPassword(linkId, passwordType, password)

        if (result?.needsLogin) {
            setLoading(false)
            setShowSessionExpired(true)
            return
        }

        setLoading(false)

        if (result?.error) {
            toast.error("更新失败", { description: result.error })
        } else {
            toast.success(
                passwordType === 'none' ? "已移除密码保护" : "密码已更新"
            )
            onOpenChange(false)
            // 重置状态
            setPassword('')
            if (onSuccess) onSuccess()
        }
    }

    const handleClose = (newOpen: boolean) => {
        if (!newOpen) {
            // 重置状态
            setPasswordType((currentPasswordType as PasswordType) || 'none')
            setPassword('')
        }
        onOpenChange(newOpen)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            重置密码保护
                        </DialogTitle>
                        <DialogDescription>
                            修改此链接的密码保护设置
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* 密码类型选择 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">密码类型</label>
                            <Select
                                value={passwordType}
                                onValueChange={(val) => {
                                    setPasswordType(val as PasswordType)
                                    setPassword('')
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        <div className="flex items-center gap-2">
                                            <ShieldOff className="h-4 w-4 text-muted-foreground" />
                                            <span>无密码保护</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="six_digit">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <span>6位数字密码</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="custom">
                                        <div className="flex items-center gap-2">
                                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                                            <span>自定义口令</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 6位数字密码输入 */}
                        {passwordType === 'six_digit' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">输入6位数字密码</label>
                                <InputOTP
                                    maxLength={6}
                                    value={password}
                                    onChange={(value) => {
                                        const numericValue = value.replace(/[^0-9]/g, '')
                                        setPassword(numericValue)
                                    }}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    containerClassName="w-full justify-between"
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} className="flex-1 w-full aspect-square h-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={1} className="flex-1 w-full aspect-square h-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={2} className="flex-1 w-full aspect-square h-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} className="flex-1 w-full aspect-square h-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={4} className="flex-1 w-full aspect-square h-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={5} className="flex-1 w-full aspect-square h-12" />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        )}

                        {/* 自定义口令输入 */}
                        {passwordType === 'custom' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">输入自定义口令</label>
                                <Input
                                    type="text"
                                    placeholder="输入自定义口令 (最长128位)"
                                    value={password}
                                    onChange={(e) => {
                                        const val = e.target.value.slice(0, 128)
                                        setPassword(val)
                                    }}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                />
                                <p className="text-xs text-muted-foreground">
                                    当前长度: {password.length} / 128
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
                            取消
                        </Button>
                        <LoadingButton
                            onClick={handleSubmit}
                            loading={loading}
                        >
                            {passwordType === 'none' ? '移除密码' : '保存密码'}
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SessionExpiredDialog open={showSessionExpired} onOpenChange={setShowSessionExpired} />
        </>
    )
}
