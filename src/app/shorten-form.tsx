'use client'

import { toastMessages, validateUrl, validateSlug } from '@/lib/validation'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/copy-button'
import { toast } from "sonner"
import { LoaderCircle, KeyRound } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { User } from '@supabase/supabase-js'
import { LinkFormFields, PasswordType } from '@/components/link-form-fields'
import { LinkArrowIcon } from '@/components/link-arrow-icon'
import { getSiteSettings } from '@/app/dashboard/settings-actions'

export function ShortenForm({ user }: { user: User | null }) {
    const router = useRouter()

    // 状态管理
    const [url, setUrl] = useState('')
    const [slug, setSlug] = useState('')
    const [showCustomOption, setShowCustomOption] = useState(false)
    const [placeholderSlug, setPlaceholderSlug] = useState('')
    const [allowPublicShorten, setAllowPublicShorten] = useState(false)

    // 结果与加载状态
    const [shortUrlSlug, setShortUrlSlug] = useState('')
    const [loading, setLoading] = useState(false)
    const [isButtonHovered, setIsButtonHovered] = useState(false)

    // 密码状态
    const [passwordType, setPasswordType] = useState<PasswordType>('none')
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    // 获取站点设置
    useEffect(() => {
        async function fetchSiteSettings() {
            const settings = await getSiteSettings()
            console.log('--- ShortenForm Debug ---')
            console.log('getSiteSettings result:', settings)
            console.log('allowPublicShorten:', settings.allowPublicShorten)
            console.log('-------------------------')
            setAllowPublicShorten(settings.allowPublicShorten)
        }
        fetchSiteSettings()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log('handleSubmit - allowPublicShorten:', allowPublicShorten, 'user:', user)

        // 如果不允许公开缩短且用户未登录，提示登录
        if (!user && !allowPublicShorten) {
            // 创建自定义登录按钮内容组件（用 div 代替 button 避免嵌套）
            const LoginButtonContent = () => {
                const [isHovered, setIsHovered] = useState(false)

                return (
                    <div
                        className="relative inline-flex items-center justify-center w-12 h-full"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={() => setIsHovered(true)}
                        onTouchEnd={() => setIsHovered(false)}
                    >
                        <motion.span
                            initial={false}
                            animate={{
                                opacity: isHovered ? 0 : 1,
                                x: isHovered ? -10 : 0
                            }}
                            transition={{ duration: 0.2 }}
                            className="absolute"
                        >
                            登录
                        </motion.span>
                        <motion.span
                            initial={false}
                            animate={{
                                opacity: isHovered ? 1 : 0,
                                x: isHovered ? 0 : 10
                            }}
                            transition={{ duration: 0.2 }}
                            className="absolute"
                        >
                            →
                        </motion.span>
                    </div>
                )
            }

            toastMessages.loginRequired(
                <KeyRound className="h-5 w-5" />,
                {
                    label: <LoginButtonContent />,
                    onClick: () => router.push('/login')
                }
            )
            return
        }

        // 验证 URL 和 Slug
        if (!validateUrl(url) || !validateSlug(slug)) {
            return
        }

        // 密码验证
        if (passwordType === 'six_digit' && password.length !== 6) {
            setPasswordError('请输入完整的6位数字密码')
            return
        }
        if (passwordType === 'custom' && password.length === 0) {
            setPasswordError('请输入自定义口令')
            return
        }

        setLoading(true)
        setShortUrlSlug('')

        const toastId = toastMessages.linkCreating()

        // 如果用户没有输入 slug，使用 placeholder
        const finalSlug = slug || placeholderSlug

        try {
            const res = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    slug: finalSlug,
                    passwordType: passwordType !== 'none' ? passwordType : undefined,
                    password: passwordType !== 'none' ? password : undefined
                }),
            })
            const data = await res.json()

            if (data.slug) {
                setShortUrlSlug(data.slug)
                // 重置表单
                setUrl('')
                setSlug('')
                setShowCustomOption(false)
                setPasswordType('none')
                setPassword('')
                setPasswordError('')
                toastMessages.linkCreateSuccess(toastId)
            } else {
                // 根据错误类型显示不同的 toast
                if (data.error === 'URL_NOT_ACCESSIBLE') {
                    toastMessages.urlNotAccessible(data.statusCode)
                    toast.dismiss(toastId)
                } else if (data.error === 'URL_TIMEOUT') {
                    toastMessages.urlTimeout()
                    toast.dismiss(toastId)
                } else if (data.error === 'URL_VERIFICATION_FAILED') {
                    toastMessages.urlVerificationFailed()
                    toast.dismiss(toastId)
                } else if (data.error === 'URL_MALICIOUS') {
                    toastMessages.urlMalicious(data.threats)
                    toast.dismiss(toastId)
                } else if (data.error === 'URL_SUFFIX_BLOCKED') {
                    toastMessages.urlSuffixBlocked()
                    toast.dismiss(toastId)
                } else if (data.error === 'URL_DOMAIN_BLOCKED') {
                    toastMessages.urlDomainBlocked()
                    toast.dismiss(toastId)
                } else if (data.error === 'SLUG_BLOCKED') {
                    toastMessages.slugBlocked()
                    toast.dismiss(toastId)
                } else {
                    toastMessages.linkCreateError(data.error || "生成失败", toastId)
                }
            }
        } catch (error) {
            console.error(error)
            toastMessages.networkError(toastId)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="grid w-full items-center gap-4" noValidate>

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
                    passwordType={passwordType}
                    setPasswordType={setPasswordType}
                    password={password}
                    setPassword={setPassword}
                    passwordError={passwordError}
                    setPasswordError={setPasswordError}
                />

                <Button
                    disabled={loading}
                    type="submit"
                    className="w-full gap-2"
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                    onTouchStart={() => setIsButtonHovered(true)}
                    onTouchEnd={() => setIsButtonHovered(false)}
                >
                    {loading ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <LinkArrowIcon isHovered={isButtonHovered} />
                            生成短链接
                        </>
                    )}
                </Button>
            </form>

            {/* --- 结果显示 (保持不变) --- */}
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
