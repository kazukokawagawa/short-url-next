'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation' // 引入路由用于手动跳转
import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner" // 引入 Toast
import Link from "next/link"
import { LoaderCircle } from "lucide-react" // 引入 Loading 图标

import { ActionScale } from "@/components/action-scale"
import { FadeIn } from "@/components/animations/fade-in"
import { TerminalArrowIcon } from "@/components/terminal-arrow-icon"
import { MailSendIcon } from "@/components/mail-send-icon"
import { HomeArrowLeftIcon } from "@/components/home-arrow-left-icon"
import { useLoading } from "@/components/providers/loading-provider"
import { TurnstileDialog } from "@/components/turnstile-dialog"
import { getPublicSecuritySettings } from "@/app/admin/actions"
import { useEffect, useRef } from "react"

export default function LoginPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = use(props.searchParams)
    const router = useRouter() // 初始化路由
    const { isLoading: isGlobalLoading, setIsLoading: setGlobalLoading } = useLoading()

    const [hoverState, setHoverState] = useState<'idle' | 'login' | 'signup'>('idle')
    // 新增：专门控制 Login 按钮的加载状态
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    // 新增：专门控制 Signup 按钮的加载状态
    const [isSigningUp, setIsSigningUp] = useState(false)
    // 1. 新增：专门存放字段验证错误信息
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
    const [isBackButtonHovered, setIsBackButtonHovered] = useState(false)

    // Turnstile 验证相关状态
    const [turnstileEnabled, setTurnstileEnabled] = useState(false)
    const [turnstileSiteKey, setTurnstileSiteKey] = useState("")
    const [showTurnstileDialog, setShowTurnstileDialog] = useState(false)
    const pendingFormDataRef = useRef<FormData | null>(null)

    // 页面加载完成后关闭全局 Loading 并加载安全设置
    useEffect(() => {
        setGlobalLoading(false)
        // 加载安全设置
        getPublicSecuritySettings().then(settings => {
            setTurnstileEnabled(settings.enabled)
            setTurnstileSiteKey(settings.siteKey)
        })
    }, [setGlobalLoading])

    const initialDescription = "输入你的账户以登录控制台"
    const titles = { login: "欢迎回来", signup: "新的伙伴" }

    // --- 1. 处理登录逻辑 ---
    const handleLogin = async (formData: FormData) => {
        // 每次提交前先清空旧错误
        setErrors({})

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        // --- 手动校验逻辑 (替代浏览器的 required) ---
        const newErrors: typeof errors = {}
        if (!email) newErrors.email = "请输入邮箱地址"
        if (!password) newErrors.password = "请输入密码"

        // 如果有错误，阻止提交，显示错误 UI
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return // 终止执行，不调用后端
        }

        setIsLoggingIn(true)

        try {
            const res = await login(formData)

            if (res?.error) {
                // 失败提示
                toast.error("登录失败", { description: res.error })
                setIsLoggingIn(false) // 只有失败才停止 loading，成功了就保持 loading 直到跳转
            } else if (res?.success) {
                // 成功提示
                toast.success("登录成功", { description: "正在跳转到控制台..." })
                // 手动跳转
                setGlobalLoading(true) // 触发全局 Loading
                router.push('/dashboard')
                // 注意：这里不设置 setIsLoggingIn(false)，让按钮一直转圈直到页面切换，体验更好
            }
        } catch (e) {
            toast.error("网络错误", { description: "请稍后重试" })
            setIsLoggingIn(false)
        }
    }

    // --- 2. 处理注册逻辑 ---
    const handleSignup = async (formData: FormData, turnstileToken?: string) => {
        setErrors({})
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const newErrors: typeof errors = {}
        if (!email) newErrors.email = "请输入邮箱地址"
        if (!password) newErrors.password = "请输入密码"
        if (password && password.length < 6) newErrors.password = "密码长度不能少于 6 位"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // 如果启用了 Turnstile 验证且没有 token，则显示验证弹窗
        if (turnstileEnabled && turnstileSiteKey && !turnstileToken) {
            pendingFormDataRef.current = formData
            setShowTurnstileDialog(true)
            return
        }

        setIsSigningUp(true)
        const toastId = toast.loading("正在发送验证邮件...")

        try {
            // 将 token 添加到 formData
            if (turnstileToken) {
                formData.set('turnstileToken', turnstileToken)
            }
            const res = await signup(formData)

            if (res?.error) {
                toast.error("注册失败", { description: res.error, id: toastId })
            } else if (res?.success) {
                // 邮件发送提示
                toast.success("验证邮件已发送！", {
                    description: "请前往邮箱查收链接以完成注册。",
                    duration: 5000, // 让它多显示一会儿
                    id: toastId
                })
            }
        } catch (e) {
            toast.error("发生错误", { id: toastId })
        } finally {
            setIsSigningUp(false) // 注册无论成功失败，都恢复按钮状态
            pendingFormDataRef.current = null
        }
    }

    // Turnstile 验证成功后的回调
    const handleTurnstileSuccess = (token: string) => {
        if (pendingFormDataRef.current) {
            handleSignup(pendingFormDataRef.current, token)
        }
    }

    if (isGlobalLoading) return null // 全局 Loading 时隐藏页面

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background">
            {/* --- ✨ 新增：返回首页按钮 --- */}
            <FadeIn delay={0} className="absolute top-4 left-4 md:top-8 md:left-8">
                <Button
                    variant="ghost"
                    className="-ml-2 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    onMouseEnter={() => setIsBackButtonHovered(true)}
                    onMouseLeave={() => setIsBackButtonHovered(false)}
                    onTouchStart={() => setIsBackButtonHovered(true)}
                    onTouchEnd={() => setIsBackButtonHovered(false)}
                    onClick={() => {
                        setGlobalLoading(true)
                        router.push("/")
                    }}
                >
                    <HomeArrowLeftIcon isHovered={isBackButtonHovered} />
                    返回首页
                </Button>
            </FadeIn>
            <FadeIn delay={0.1} className="w-full max-w-md">
                <Card className="w-full overflow-hidden">
                    <CardHeader className="relative h-[100px] flex flex-col items-start justify-start pt-4 pl-6 text-left">

                        {/* --- 浮现的标题 --- */}
                        <AnimatePresence>
                            {hoverState !== 'idle' && (
                                <div className="absolute top-4 left-6 z-10">
                                    <motion.h1
                                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                                        className="text-3xl font-bold tracking-tight text-foreground"
                                    >
                                        {titles[hoverState]}
                                    </motion.h1>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* --- 平滑移动的描述文字 --- */}
                        <motion.p
                            style={{ transformOrigin: "0 0" }} // 关键修改：从左上角缩放，保证对齐
                            animate={{
                                y: hoverState === 'idle' ? 0 : 40,
                                scale: hoverState === 'idle' ? 1 : 0.6,
                                opacity: hoverState === 'idle' ? 1 : 0.7,
                            }}
                            transition={{
                                duration: 0.5,
                                ease: [0.25, 0.1, 0.25, 1.0]
                            }}
                            className={cn(
                                "text-2xl font-bold text-foreground m-0", // 移除 margin 干扰
                                "transition-colors duration-500",
                                hoverState !== 'idle' && "text-muted-foreground font-normal"
                            )}
                        >
                            {initialDescription}
                        </motion.p>
                    </CardHeader>

                    <CardContent>
                        <form
                            // 禁用浏览器默认验证气泡
                            noValidate
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                {/* 给 Label 加红星提示 (可选) */}
                                <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>
                                    邮箱
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="username@example.com"
                                    // 移除 required (已手写校验)
                                    // required 

                                    // 动态样式：如果有错，加红框
                                    className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
                                />
                                {/* 显示错误文字 */}
                                {errors.email && (
                                    <span className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
                                        {errors.email}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className={errors.password ? "text-red-500" : ""}>
                                    密码
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    // required  <-- 移除
                                    className={cn(errors.password && "border-red-500 focus-visible:ring-red-500")}
                                />
                                {errors.password && (
                                    <span className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
                                        {errors.password}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mt-6 z-20 relative">
                                {/* --- 登录按钮 --- */}
                                <ActionScale
                                    onHoverStart={() => setHoverState('login')}
                                    onHoverEnd={() => setHoverState('idle')}
                                    onTouchStart={() => setHoverState('login')}
                                    onTouchEnd={() => setHoverState('idle')}
                                    className="w-full"
                                    disabled={isLoggingIn || isSigningUp}
                                >
                                    {/* formAction={handleLogin} 
                   Next.js 允许 formAction 接受一个 async function 
                */}
                                    <Button
                                        formAction={handleLogin}
                                        disabled={isLoggingIn || isSigningUp} // 防止重复点击
                                        className="w-full"
                                    >
                                        {isLoggingIn ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                登录中...
                                            </>
                                        ) : (
                                            <>
                                                <TerminalArrowIcon isHovered={hoverState === 'login'} />
                                                登录
                                            </>
                                        )}
                                    </Button>
                                </ActionScale>

                                {/* --- 注册按钮 --- */}
                                <ActionScale
                                    onHoverStart={() => setHoverState('signup')}
                                    onHoverEnd={() => setHoverState('idle')}
                                    onTouchStart={() => setHoverState('signup')}
                                    onTouchEnd={() => setHoverState('idle')}
                                    className="w-full"
                                    disabled={isLoggingIn || isSigningUp}
                                >
                                    <Button
                                        formAction={handleSignup}
                                        disabled={isLoggingIn || isSigningUp}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {isSigningUp ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                注册中...
                                            </>
                                        ) : (
                                            <>
                                                <MailSendIcon isHovered={hoverState === 'signup'} />
                                                注册
                                            </>
                                        )}
                                    </Button>
                                </ActionScale>
                            </div>

                            {searchParams?.message && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 text-center text-sm text-red-500 bg-red-50 p-2 rounded"
                                >
                                    {searchParams.message}
                                </motion.p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </FadeIn>

            {/* Turnstile 验证弹窗 */}
            {turnstileEnabled && turnstileSiteKey && (
                <TurnstileDialog
                    open={showTurnstileDialog}
                    onOpenChange={setShowTurnstileDialog}
                    siteKey={turnstileSiteKey}
                    onSuccess={handleTurnstileSuccess}
                    onError={() => {
                        toast.error("验证失败", { description: "请重试" })
                    }}
                />
            )}
        </div>
    )
}