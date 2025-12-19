'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, KeyRound, LoaderCircle, Check, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp'

interface VerifyPasswordClientProps {
    slug: string
    passwordType: 'six_digit' | 'custom'
}

export function VerifyPasswordClient({ slug, passwordType }: VerifyPasswordClientProps) {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isButtonHovered, setIsButtonHovered] = useState(false)
    const [isBackButtonHovered, setIsBackButtonHovered] = useState(false)

    const handleVerify = async () => {
        if (passwordType === 'six_digit' && password.length !== 6) {
            toast.warning('请输入完整的6位密码')
            return
        }
        if (passwordType === 'custom' && password.length === 0) {
            toast.warning('请输入访问口令')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, password })
            })

            const data = await res.json()

            if (data.success && data.url) {
                toast.success('验证成功，正在跳转...')
                // 使用 window.location 进行跳转以支持外部链接
                window.location.href = data.url
            } else if (data.tooManyAttempts) {
                toast.error('尝试次数过多', {
                    description: '您已超过最大尝试次数，请1小时后再试'
                })
            } else {
                toast.error('验证失败', {
                    description: data.error || '密码错误'
                })
                setPassword('')
            }
        } catch (err) {
            console.error(err)
            toast.error('网络错误', {
                description: '请检查网络连接后重试'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            handleVerify()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                        >
                            <Lock className="h-8 w-8 text-primary" />
                        </motion.div>
                        <CardTitle className="text-xl">
                            {passwordType === 'six_digit' ? '输入访问密码' : '输入访问口令'}
                        </CardTitle>
                        <CardDescription>
                            {passwordType === 'six_digit'
                                ? '此链接受密码保护，请输入6位数字密码'
                                : '此链接受口令保护，请输入访问口令'
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* 密码输入区域 */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center gap-4"
                        >
                            {passwordType === 'six_digit' ? (
                                <InputOTP
                                    maxLength={6}
                                    value={password}
                                    onChange={(value) => {
                                        const numericValue = value.replace(/[^0-9]/g, '')
                                        setPassword(numericValue)
                                    }}
                                    onKeyDown={handleKeyDown}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoFocus
                                    containerClassName="w-full justify-between max-w-xs"
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} className="h-12 w-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={1} className="h-12 w-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={2} className="h-12 w-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} className="h-12 w-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={4} className="h-12 w-12" />
                                    </InputOTPGroup>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={5} className="h-12 w-12" />
                                    </InputOTPGroup>
                                </InputOTP>
                            ) : (
                                <div className="w-full relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="输入访问口令"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                        }}
                                        onKeyDown={handleKeyDown}
                                        className="pl-10"
                                        autoFocus
                                        autoComplete="off"
                                        data-1p-ignore
                                    />
                                </div>
                            )}
                        </motion.div>

                        {/* 验证按钮 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Button
                                onClick={handleVerify}
                                disabled={loading}
                                className="w-full gap-2"
                                onMouseEnter={() => setIsButtonHovered(true)}
                                onMouseLeave={() => setIsButtonHovered(false)}
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        验证中...
                                    </>
                                ) : (
                                    <>
                                        <div className="relative inline-flex items-center justify-center w-4 h-4 mr-1">
                                            <AnimatePresence mode="wait">
                                                {!isButtonHovered ? (
                                                    <motion.span
                                                        key="lock"
                                                        className="absolute"
                                                        initial={{ opacity: 0, x: -3 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 3 }}
                                                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                                                    >
                                                        <Lock className="h-4 w-4" />
                                                    </motion.span>
                                                ) : (
                                                    <motion.span
                                                        key="check"
                                                        className="absolute"
                                                        initial={{ opacity: 0, x: -3 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 3 }}
                                                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        验证并访问
                                    </>
                                )}
                            </Button>
                        </motion.div>

                        {/* 返回首页按钮 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-center"
                        >
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/')}
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onMouseEnter={() => setIsBackButtonHovered(true)}
                                onMouseLeave={() => setIsBackButtonHovered(false)}
                                onTouchStart={() => setIsBackButtonHovered(true)}
                                onTouchEnd={() => setIsBackButtonHovered(false)}
                            >
                                <div className="relative inline-flex items-center justify-center w-16 h-full">
                                    <AnimatePresence mode="wait">
                                        {!isBackButtonHovered ? (
                                            <motion.span
                                                key="text"
                                                className="absolute"
                                                initial={{ opacity: 0, x: 3 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -3 }}
                                                transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                                            >
                                                返回首页
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="arrow"
                                                className="absolute"
                                                initial={{ opacity: 0, x: 3 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -3 }}
                                                transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
