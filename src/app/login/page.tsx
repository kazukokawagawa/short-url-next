'use client'

import { useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { LoaderCircle, Mail, Lock, ArrowLeft, ArrowRight, KeyRound } from "lucide-react"

import { ActionScale } from "@/components/action-scale"
import { FadeIn } from "@/components/animations/fade-in"
import { TerminalArrowIcon } from "@/components/terminal-arrow-icon"
import { MailSendIcon } from "@/components/mail-send-icon"
import { HomeArrowLeftIcon } from "@/components/home-arrow-left-icon"
import { useLoading } from "@/components/providers/loading-provider"
import { TurnstileInline, TurnstileInlineRef } from "@/components/turnstile-inline"
import { getPublicSecuritySettings } from "@/app/admin/actions"
import { getSiteSettings } from "@/app/dashboard/settings-actions"
import { useEffect } from "react"
import { PasswordStrength } from "@/components/password-strength"

// 视图状态类型
type ViewState = 'initial' | 'login' | 'signup-email' | 'signup-password' | 'signup-captcha'

// 统一动画时长
const ANIMATION_DURATION = 0.5

export default function LoginPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = use(props.searchParams)
    const router = useRouter()
    const { setIsLoading: setGlobalLoading } = useLoading()

    // 视图状态控制
    const [viewState, setViewState] = useState<ViewState>('initial')
    // 悬停状态（用于按钮动画效果）
    const [hoverState, setHoverState] = useState<'idle' | 'login' | 'signup'>('idle')

    // 按钮加载状态
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [isSigningUp, setIsSigningUp] = useState(false)
    // 界面切换过渡状态
    const [isTransitioning, setIsTransitioning] = useState(false)

    const [isBackButtonHovered, setIsBackButtonHovered] = useState(false)

    // Turnstile 相关状态
    const [turnstileEnabled, setTurnstileEnabled] = useState(false)
    const [turnstileSiteKey, setTurnstileSiteKey] = useState("")
    const [openRegistration, setOpenRegistration] = useState(true)

    // 表单数据
    const [emailValue, setEmailValue] = useState('')
    const [passwordValue, setPasswordValue] = useState('')

    // Turnstile ref
    const turnstileRef = useRef<TurnstileInlineRef>(null)

    // 页面加载完成后关闭全局 Loading 并加载设置
    useEffect(() => {
        setGlobalLoading(false)

        getPublicSecuritySettings()
            .then(settings => {
                setTurnstileEnabled(settings.enabled)
                setTurnstileSiteKey(settings.siteKey)
            })
            .catch(err => {
                console.error('Failed to load security settings:', err)
            })

        getSiteSettings()
            .then(settings => {
                setOpenRegistration(settings.openRegistration)
            })
            .catch(err => {
                console.error('Failed to load site settings:', err)
            })
    }, [setGlobalLoading])

    // 标题映射
    const titles: Record<ViewState, string> = {
        'initial': '',
        'login': '欢迎回来',
        'signup-email': '新的伙伴',
        'signup-password': '设置密码',
        'signup-captcha': '人机验证'
    }

    // 描述文字映射
    const descriptions: Record<ViewState, string> = {
        'initial': '登录或注册以继续',
        'login': '输入你的账户以登录控制台',
        'signup-email': '使用邮箱注册新账户',
        'signup-password': '设置一个安全的密码',
        'signup-captcha': '请完成人机验证'
    }

    // 判断是否显示标题
    const showTitle = viewState !== 'initial'

    // 重置到初始状态
    const resetToInitial = () => {
        setViewState('initial')
        setHoverState('idle')
        setEmailValue('')
        setPasswordValue('')
        turnstileRef.current?.reset()
    }

    // --- 登录逻辑 ---
    const handleLoginSubmit = async () => {
        if (!emailValue) {
            toast.error("请输入邮箱地址")
            return
        }
        if (!passwordValue) {
            toast.error("请输入密码")
            return
        }

        setIsLoggingIn(true)
        const toastId = toast.loading("登陆中...")

        try {
            const formData = new FormData()
            formData.set('email', emailValue)
            formData.set('password', passwordValue)

            const res = await login(formData)

            if (res?.error) {
                toast.error("登录失败", { description: res.error, id: toastId })
                setIsLoggingIn(false)
            } else if (res?.success) {
                toast.success("登录成功", { description: "正在跳转到控制台...", id: toastId })
                setGlobalLoading(true)
                router.push('/dashboard')
            }
        } catch {
            toast.error("网络错误", { description: "请稍后重试", id: toastId })
            setIsLoggingIn(false)
        }
    }

    // --- 点击登录按钮（初始状态 -> loading -> 登录流程 / 登录流程中 -> 提交） ---
    const handleLoginClick = () => {
        if (viewState === 'initial') {
            setIsTransitioning(true)
            setTimeout(() => {
                setViewState('login')
                setIsTransitioning(false)
            }, 300)
        } else if (viewState === 'login') {
            handleLoginSubmit()
        }
    }

    // --- 注册流程：下一步 ---
    const handleSignupNext = () => {
        if (viewState === 'initial') {
            if (!openRegistration) {
                toast.error("暂未开放用户注册", {
                    description: "管理员已关闭新用户注册功能"
                })
                return
            }
            setIsTransitioning(true)
            setTimeout(() => {
                setViewState('signup-email')
                setIsTransitioning(false)
            }, 300)
        } else if (viewState === 'signup-email') {
            // 验证邮箱
            if (!emailValue) {
                toast.error("请输入邮箱地址")
                return
            }
            // 简单邮箱格式验证
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                toast.error("请输入有效的邮箱地址")
                return
            }
            setViewState('signup-password')
        } else if (viewState === 'signup-password') {
            // 验证密码
            if (!passwordValue) {
                toast.error("请输入密码")
                return
            }
            if (passwordValue.length < 6) {
                toast.error("密码长度不能少于 6 位")
                return
            }
            // 进入人机验证
            if (turnstileEnabled && turnstileSiteKey) {
                setViewState('signup-captcha')
            } else {
                // 无需人机验证，直接提交
                handleSignupSubmit()
            }
        }
    }

    // --- 提交注册 ---
    const handleSignupSubmit = async (turnstileToken?: string) => {
        setIsSigningUp(true)
        const toastId = toast.loading("正在检查信息...")

        try {
            const formData = new FormData()
            formData.set('email', emailValue)
            formData.set('password', passwordValue)
            if (turnstileToken) {
                formData.set('turnstileToken', turnstileToken)
            }

            const res = await signup(formData)

            if (res?.error) {
                if (res?.emailExists) {
                    toast.error("该邮箱已被注册", {
                        description: "请直接登录或使用其他邮箱",
                        id: toastId
                    })
                } else {
                    toast.error("注册失败", { description: res.error, id: toastId })
                }
                setIsSigningUp(false)
                // 回到邮箱步骤
                setViewState('signup-email')
            } else if (res?.success) {
                toast.loading("正在发送验证邮件...", { id: toastId })
                setTimeout(() => {
                    toast.success("验证邮件已发送！", {
                        description: "请前往邮箱查收链接以完成注册。",
                        duration: 5000,
                        id: toastId
                    })
                    // 注册成功后切换到登录界面
                    setIsSigningUp(false)
                    setPasswordValue('')
                    setViewState('login')
                }, 500)
            }
        } catch {
            toast.error("发生错误", { id: toastId })
            setIsSigningUp(false)
            setViewState('signup-email')
        }
    }

    // Turnstile 验证成功回调
    const handleTurnstileSuccess = (token: string) => {
        handleSignupSubmit(token)
    }

    // 统一动画配置 - 从右到左滑入
    const slideAnimation = {
        initial: { opacity: 0, x: 15 },
        animate: { opacity: 1, x: 0, transition: { duration: ANIMATION_DURATION, ease: [0.25, 0.1, 0.25, 1.0] as const } },
        exit: { opacity: 0, x: -15, transition: { duration: 0.15 } }
    }

    // 输入框动画 - 与标题相同的从右到左滑入
    const fieldAnimation = {
        initial: { opacity: 0, x: 15 },
        animate: { opacity: 1, x: 0, transition: { duration: ANIMATION_DURATION, ease: [0.25, 0.1, 0.25, 1.0] as const } },
        exit: { opacity: 0, x: -15, transition: { duration: 0.15 } }
    }

    // 获取当前步骤的图标
    const getStepIcon = (isHovered: boolean) => {
        if (isHovered) {
            return <ArrowRight className="mr-2 h-4 w-4" />
        }

        switch (viewState) {
            case 'initial':
                return <MailSendIcon isHovered={false} />
            case 'signup-email':
                return <Mail className="mr-2 h-4 w-4" />
            case 'signup-password':
                return <KeyRound className="mr-2 h-4 w-4" />
            default:
                return <ArrowRight className="mr-2 h-4 w-4" />
        }
    }

    return (
        <>
            <div className="relative flex min-h-screen items-center justify-center">

                {/* --- 返回首页/返回按钮 --- */}
                <FadeIn delay={0} className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
                    <Button
                        variant="ghost"
                        className="-ml-2 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        onMouseEnter={() => setIsBackButtonHovered(true)}
                        onMouseLeave={() => setIsBackButtonHovered(false)}
                        onTouchStart={() => setIsBackButtonHovered(true)}
                        onTouchEnd={() => setIsBackButtonHovered(false)}
                        onClick={() => {
                            if (viewState !== 'initial') {
                                // 返回上一步
                                if (viewState === 'login') {
                                    resetToInitial()
                                } else if (viewState === 'signup-email') {
                                    resetToInitial()
                                } else if (viewState === 'signup-password') {
                                    setViewState('signup-email')
                                } else if (viewState === 'signup-captcha') {
                                    setViewState('signup-password')
                                    turnstileRef.current?.reset()
                                }
                            } else {
                                setGlobalLoading(true)
                                router.push("/")
                            }
                        }}
                    >
                        {viewState !== 'initial' ? (
                            <>
                                <ArrowLeft className="h-4 w-4" />
                                返回
                            </>
                        ) : (
                            <>
                                <HomeArrowLeftIcon isHovered={isBackButtonHovered} />
                                返回首页
                            </>
                        )}
                    </Button>
                </FadeIn>

                <FadeIn delay={0.1} className="w-full max-w-md px-4">
                    <Card className="w-full overflow-hidden">
                        {isTransitioning ? (
                            // Loading过渡状态：显示居中的loading，高度与登录界面一致
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-24"
                            >
                                <LoaderCircle className="h-10 w-10 animate-spin text-muted-foreground" />
                            </motion.div>
                        ) : (
                            <>
                                <CardHeader className="relative h-[120px] flex flex-col items-center justify-center text-center pb-2">
                                    {/* --- 浮现的标题 --- */}
                                    <AnimatePresence mode="wait">
                                        {showTitle && (
                                            <motion.h1
                                                key={`title-${viewState}`}
                                                initial={{ opacity: 0, x: 15 }}
                                                animate={{ opacity: 1, x: 0, transition: { duration: ANIMATION_DURATION, ease: [0.25, 0.1, 0.25, 1.0] as const } }}
                                                exit={{ opacity: 0, x: -15, transition: { duration: 0.15 } }}
                                                className="text-3xl font-bold tracking-tight text-foreground mb-2"
                                            >
                                                {titles[viewState]}
                                            </motion.h1>
                                        )}
                                    </AnimatePresence>

                                    {/* --- 副标题 - 从右到左淡入淡出 --- */}
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={`desc-${viewState}`}
                                            initial={{ opacity: 0, x: 15 }}
                                            animate={{ opacity: 1, x: 0, transition: { duration: ANIMATION_DURATION, ease: [0.25, 0.1, 0.25, 1.0] as const } }}
                                            exit={{ opacity: 0, x: -15, transition: { duration: 0.15 } }}
                                            className={cn(
                                                "text-center m-0",
                                                showTitle
                                                    ? "text-base text-muted-foreground"
                                                    : "text-2xl font-semibold text-foreground"
                                            )}
                                        >
                                            {descriptions[viewState]}
                                        </motion.p>
                                    </AnimatePresence>
                                </CardHeader>

                                <CardContent className="pt-2">
                                    <div className="space-y-4">
                                        {/* --- 表单字段区域（统一AnimatePresence防止抽动）--- */}
                                        <AnimatePresence mode="wait">
                                            {/* 登录模式：同时显示邮箱和密码 */}
                                            {viewState === 'login' && (
                                                <motion.div
                                                    key="login-fields"
                                                    {...fieldAnimation}
                                                    className="space-y-4"
                                                >
                                                    {/* 邮箱 */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">
                                                            邮箱
                                                        </Label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="email"
                                                                name="email"
                                                                type="email"
                                                                placeholder="username@example.com"
                                                                value={emailValue}
                                                                onChange={(e) => setEmailValue(e.target.value)}
                                                                className="pl-10"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault()
                                                                        handleLoginSubmit()
                                                                    }
                                                                }}
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* 密码 */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="password">
                                                            密码
                                                        </Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="password"
                                                                name="password"
                                                                type="password"
                                                                value={passwordValue}
                                                                onChange={(e) => setPasswordValue(e.target.value)}
                                                                className="pl-10"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault()
                                                                        handleLoginSubmit()
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* 注册步骤1：只显示邮箱 */}
                                            {viewState === 'signup-email' && (
                                                <motion.div
                                                    key="signup-email-field"
                                                    {...fieldAnimation}
                                                    className="space-y-2"
                                                >
                                                    <Label htmlFor="email">
                                                        邮箱
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            placeholder="username@example.com"
                                                            value={emailValue}
                                                            onChange={(e) => setEmailValue(e.target.value)}
                                                            className="pl-10"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    handleSignupNext()
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* 注册步骤2：只显示密码 */}
                                            {viewState === 'signup-password' && (
                                                <motion.div
                                                    key="signup-password-field"
                                                    {...fieldAnimation}
                                                    className="space-y-2"
                                                >
                                                    <Label htmlFor="password">
                                                        密码
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="password"
                                                            name="password"
                                                            type="password"
                                                            value={passwordValue}
                                                            onChange={(e) => setPasswordValue(e.target.value)}
                                                            className="pl-10"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    handleSignupNext()
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    {/* 密码强度指示器 */}
                                                    {passwordValue && (
                                                        <PasswordStrength password={passwordValue} />
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* 注册步骤3：人机验证 */}
                                            {viewState === 'signup-captcha' && turnstileEnabled && turnstileSiteKey && (
                                                <motion.div
                                                    key="captcha-field"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1, transition: { duration: 0.3 } }}
                                                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                                    className="flex flex-col items-center"
                                                >
                                                    <TurnstileInline
                                                        ref={turnstileRef}
                                                        siteKey={turnstileSiteKey}
                                                        onSuccess={handleTurnstileSuccess}
                                                        onError={() => {
                                                            toast.error("验证失败", { description: "请重试" })
                                                        }}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* --- 按钮区域（统一AnimatePresence防止抽动）--- */}
                                        <div className="flex flex-col gap-3 pt-4">
                                            <AnimatePresence mode="wait">
                                                {/* 初始状态：显示登录和注册两个按钮 */}
                                                {viewState === 'initial' && (
                                                    <motion.div
                                                        key="initial-buttons"
                                                        initial={{ opacity: 0, x: 15 }}
                                                        animate={{ opacity: 1, x: 0, transition: { duration: ANIMATION_DURATION, ease: [0.25, 0.1, 0.25, 1.0] as const } }}
                                                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                                        className="flex flex-col gap-3"
                                                    >
                                                        {/* 登录按钮 */}
                                                        <ActionScale
                                                            onHoverStart={() => setHoverState('login')}
                                                            onHoverEnd={() => setHoverState('idle')}
                                                            onTouchStart={() => setHoverState('login')}
                                                            onTouchEnd={() => setHoverState('idle')}
                                                            className="w-full"
                                                            disabled={false}
                                                        >
                                                            <Button
                                                                type="button"
                                                                onClick={handleLoginClick}
                                                                disabled={false}
                                                                className="w-full"
                                                            >
                                                                <TerminalArrowIcon isHovered={hoverState === 'login'} />
                                                                登录
                                                            </Button>
                                                        </ActionScale>
                                                        {/* 注册按钮 */}
                                                        <ActionScale
                                                            onHoverStart={() => setHoverState('signup')}
                                                            onHoverEnd={() => setHoverState('idle')}
                                                            onTouchStart={() => setHoverState('signup')}
                                                            onTouchEnd={() => setHoverState('idle')}
                                                            className="w-full"
                                                            disabled={false}
                                                        >
                                                            <Button
                                                                type="button"
                                                                onClick={handleSignupNext}
                                                                disabled={false}
                                                                variant="outline"
                                                                className="w-full"
                                                            >
                                                                <AnimatePresence mode="wait">
                                                                    <motion.span
                                                                        key={hoverState === 'signup' ? 'arrow' : 'mail'}
                                                                        initial={{ opacity: 0, x: -3 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: 3 }}
                                                                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                                                                        className="flex items-center"
                                                                    >
                                                                        {getStepIcon(hoverState === 'signup')}
                                                                    </motion.span>
                                                                </AnimatePresence>
                                                                注册
                                                            </Button>
                                                        </ActionScale>
                                                    </motion.div>
                                                )}

                                                {/* 登录状态：只显示登录按钮 */}
                                                {viewState === 'login' && (
                                                    <motion.div
                                                        key="login-button"
                                                        initial={{ opacity: 0, x: 15 }}
                                                        animate={{ opacity: 1, x: 0, transition: { duration: ANIMATION_DURATION, ease: [0.25, 0.1, 0.25, 1.0] as const } }}
                                                        exit={{ opacity: 0, x: -15, transition: { duration: 0.15 } }}
                                                    >
                                                        <ActionScale
                                                            onHoverStart={() => setHoverState('login')}
                                                            onHoverEnd={() => setHoverState('idle')}
                                                            onTouchStart={() => setHoverState('login')}
                                                            onTouchEnd={() => setHoverState('idle')}
                                                            className="w-full"
                                                            disabled={isLoggingIn || isSigningUp}
                                                        >
                                                            <Button
                                                                type="button"
                                                                onClick={handleLoginSubmit}
                                                                disabled={isLoggingIn || isSigningUp}
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
                                                    </motion.div>
                                                )}

                                                {/* 注册流程：显示下一步按钮 */}
                                                {(viewState === 'signup-email' || viewState === 'signup-password') && (
                                                    <motion.div
                                                        key="next-button"
                                                        initial={{ opacity: 0, x: 15 }}
                                                        animate={{ opacity: 1, x: 0, transition: { duration: ANIMATION_DURATION, ease: [0.25, 0.1, 0.25, 1.0] as const } }}
                                                        exit={{ opacity: 0, x: -15, transition: { duration: 0.15 } }}
                                                    >
                                                        <ActionScale
                                                            onHoverStart={() => setHoverState('signup')}
                                                            onHoverEnd={() => setHoverState('idle')}
                                                            onTouchStart={() => setHoverState('signup')}
                                                            onTouchEnd={() => setHoverState('idle')}
                                                            className="w-full"
                                                            disabled={isSigningUp}
                                                        >
                                                            <Button
                                                                type="button"
                                                                onClick={handleSignupNext}
                                                                disabled={isSigningUp}
                                                                className="w-full"
                                                            >
                                                                {isSigningUp ? (
                                                                    <>
                                                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                                        处理中...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AnimatePresence mode="wait">
                                                                            <motion.span
                                                                                key={hoverState === 'signup' ? 'arrow' : viewState}
                                                                                initial={{ opacity: 0, x: -3 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                exit={{ opacity: 0, x: 3 }}
                                                                                transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                                                                                className="flex items-center"
                                                                            >
                                                                                {getStepIcon(hoverState === 'signup')}
                                                                            </motion.span>
                                                                        </AnimatePresence>
                                                                        下一步
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </ActionScale>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
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
                                    </div>
                                </CardContent>
                            </>
                        )}
                    </Card>
                </FadeIn>
            </div>
        </>
    )
}