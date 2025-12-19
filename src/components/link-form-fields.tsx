'use client'

import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link2, Wand2, Globe, Sparkles, Lock, CalendarClock } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { getLinksSettings } from "@/app/dashboard/settings-actions"
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

export type PasswordType = 'none' | 'six_digit' | 'custom'

interface LinkFormFieldsProps {
    url: string
    setUrl: (value: string) => void
    slug: string
    setSlug: (value: string) => void
    showCustomOption: boolean
    setShowCustomOption: (value: boolean) => void
    placeholderSlug?: string
    setPlaceholderSlug?: (value: string) => void
    expiresAt?: string
    setExpiresAt?: (value: string | undefined) => void
    passwordType?: PasswordType
    setPasswordType?: (value: PasswordType) => void
    password?: string
    setPassword?: (value: string) => void
    passwordError?: string
    setPasswordError?: (value: string) => void
}

export function LinkFormFields({
    url,
    setUrl,
    slug,
    setSlug,
    showCustomOption,
    setShowCustomOption,
    placeholderSlug: externalPlaceholderSlug,
    setPlaceholderSlug: externalSetPlaceholderSlug,
    expiresAt,
    setExpiresAt,
    passwordType: externalPasswordType,
    setPasswordType: externalSetPasswordType,
    password: externalPassword,
    setPassword: externalSetPassword,
    passwordError: externalPasswordError,
    setPasswordError: externalSetPasswordError
}: LinkFormFieldsProps) {
    const [host, setHost] = useState('')
    const [internalPlaceholderSlug, setInternalPlaceholderSlug] = useState('')
    const [defaultExpirationMinutes, setDefaultExpirationMinutes] = useState(0)
    const [expirationOption, setExpirationOption] = useState("default")
    const [customDurationValue, setCustomDurationValue] = useState("1")
    const [customDurationUnit, setCustomDurationUnit] = useState("days")

    const [internalPasswordType, setInternalPasswordType] = useState<PasswordType>('none')
    const [internalPassword, setInternalPassword] = useState('')
    const [internalPasswordError, setInternalPasswordError] = useState('')

    const placeholderSlug = externalPlaceholderSlug ?? internalPlaceholderSlug
    const setPlaceholderSlug = externalSetPlaceholderSlug ?? setInternalPlaceholderSlug
    const passwordType = externalPasswordType ?? internalPasswordType
    const setPasswordType = externalSetPasswordType ?? setInternalPasswordType
    const password = externalPassword ?? internalPassword
    const setPassword = externalSetPassword ?? setInternalPassword
    const passwordError = externalPasswordError ?? internalPasswordError
    const setPasswordError = externalSetPasswordError ?? setInternalPasswordError

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHost(window.location.host)
        }
        async function fetchAndGeneratePlaceholder() {
            const settings = await getLinksSettings()
            const generated = nanoid(settings.slugLength)
            setPlaceholderSlug(generated)
            setDefaultExpirationMinutes(settings.defaultExpiration || 0)
        }
        fetchAndGeneratePlaceholder()
    }, [])

    useEffect(() => {
        if (!setExpiresAt) return

        let minutes = 0
        if (expirationOption === "default") {
            minutes = defaultExpirationMinutes
        } else if (expirationOption === "custom") {
            let val = parseInt(customDurationValue)
            if (isNaN(val) || val <= 0) val = 1

            if (customDurationUnit === "minutes") minutes = val
            if (customDurationUnit === "hours") minutes = val * 60
            if (customDurationUnit === "days") minutes = val * 60 * 24
        } else {
            minutes = parseInt(expirationOption)
        }

        if (minutes === 0) {
            setExpiresAt(undefined)
        } else {
            const date = new Date()
            date.setMinutes(date.getMinutes() + minutes)
            setExpiresAt(date.toISOString())
        }
    }, [expirationOption, defaultExpirationMinutes, setExpiresAt, customDurationValue, customDurationUnit])

    const formatDuration = (minutes: number) => {
        if (minutes === 0) return "永不过期"
        if (minutes === 60) return "1 小时"
        if (minutes === 1440) return "24 小时"
        if (minutes === 10080) return "7 天"
        if (minutes === 43200) return "30 天"
        return `${minutes} 分钟`
    }

    return (
        <div className="grid gap-4">
            {/* URL 输入框 */}
            <div className="flex flex-col space-y-1.5 relative">
                <Label htmlFor="url">原始 URL</Label>
                <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="url"
                        name="url"
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

            {/* 高级选项区域 */}
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
                            {/* 预览卡片 */}
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

                                <div className="flex justify-start ml-4 -my-2 relative z-0">
                                    <div className="w-px h-6 bg-border/50" />
                                </div>

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

                            {/* 自定义后缀输入 */}
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="slug" className="text-xs text-muted-foreground">
                                    自定义后缀 (可选)
                                </Label>
                                <div className="relative">
                                    <Wand2 className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", slug ? "text-purple-500" : "text-muted-foreground")} />
                                    <Input
                                        id="custom-suffix-input"
                                        name="custom-suffix-xyz"
                                        placeholder={placeholderSlug || "my-custom-name"}
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className={cn("pl-9 transition-colors", slug && "border-purple-200 focus-visible:ring-purple-500/20 bg-purple-50/30")}
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        data-1p-ignore
                                        data-lpignore="true"
                                        data-form-type="other"
                                        pattern="[a-zA-Z0-9_-]*"
                                        title="只允许字母、数字、连字符和下划线"
                                    />
                                </div>
                            </div>

                            {/* 有效期 + 密码保护 (同一行) */}
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {/* 有效期 */}
                                <div className="flex flex-col space-y-1.5 w-full">
                                    <Label className="text-xs text-muted-foreground">有效期</Label>
                                    <div className="relative w-full">
                                        <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Select value={expirationOption} onValueChange={setExpirationOption}>
                                            <SelectTrigger className="pl-9 w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">默认设置 ({formatDuration(defaultExpirationMinutes)})</SelectItem>
                                                <SelectItem value="0">永不过期</SelectItem>
                                                <SelectItem value="60">1 小时</SelectItem>
                                                <SelectItem value="1440">24 小时</SelectItem>
                                                <SelectItem value="10080">7 天</SelectItem>
                                                <SelectItem value="43200">30 天</SelectItem>
                                                <SelectItem value="custom">自定义时间...</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* 密码保护 */}
                                <div className="flex flex-col space-y-1.5 w-full">
                                    <Label className="text-xs text-muted-foreground">密码保护</Label>
                                    <div className="relative w-full">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Select
                                            value={passwordType}
                                            onValueChange={(value) => {
                                                setPasswordType(value as PasswordType)
                                                setPassword('')
                                                setPasswordError('')
                                            }}
                                        >
                                            <SelectTrigger className="pl-9 w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">无密码</SelectItem>
                                                <SelectItem value="six_digit">6位数字密码</SelectItem>
                                                <SelectItem value="custom">自定义口令</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* 自定义时间输入 */}
                            <AnimatePresence>
                                {expirationOption === "custom" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex gap-2"
                                    >
                                        <div className="flex-1 relative">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={customDurationValue}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/[^0-9]/g, '')
                                                    if (val === '0') val = '1'
                                                    if (val === '') val = ''
                                                    setCustomDurationValue(val)
                                                }}
                                                onBlur={() => {
                                                    if (!customDurationValue || parseInt(customDurationValue) <= 0) {
                                                        setCustomDurationValue('1')
                                                    }
                                                }}
                                                className="pl-3 pr-2"
                                                placeholder="时长"
                                            />
                                        </div>
                                        <Select value={customDurationUnit} onValueChange={setCustomDurationUnit}>
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="minutes">分钟</SelectItem>
                                                <SelectItem value="hours">小时</SelectItem>
                                                <SelectItem value="days">天</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 6位数字密码输入 */}
                            <AnimatePresence>
                                {passwordType === 'six_digit' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="flex flex-col gap-2 w-full"
                                    >
                                        <InputOTP
                                            maxLength={6}
                                            value={password}
                                            onChange={(value) => {
                                                const numericValue = value.replace(/[^0-9]/g, '')
                                                setPassword(numericValue)
                                                if (numericValue.length === 6) {
                                                    setPasswordError('')
                                                }
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
                                        {passwordError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-xs text-red-500"
                                            >
                                                {passwordError}
                                            </motion.p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 自定义口令输入 */}
                            <AnimatePresence>
                                {passwordType === 'custom' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="flex flex-col gap-2"
                                    >
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                placeholder="输入自定义口令 (最长128位)"
                                                value={password}
                                                onChange={(e) => {
                                                    const val = e.target.value.slice(0, 128)
                                                    setPassword(val)
                                                    if (val.length > 0) {
                                                        setPasswordError('')
                                                    }
                                                }}
                                                className="transition-colors"
                                                autoComplete="new-password"
                                                autoCorrect="off"
                                                autoCapitalize="off"
                                                spellCheck="false"
                                                data-1p-ignore
                                                data-lpignore="true"
                                                data-form-type="other"
                                                name="custom-passphrase"
                                            />
                                        </div>
                                        {passwordError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-xs text-red-500"
                                            >
                                                {passwordError}
                                            </motion.p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            当前长度: {password.length} / 128
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 隐藏输入字段，用于将密码数据传递到表单 */}
            <input type="hidden" name="passwordType" value={passwordType} />
            <input type="hidden" name="password" value={password} />
        </div>
    )
}
