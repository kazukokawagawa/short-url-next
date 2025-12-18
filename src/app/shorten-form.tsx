'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/copy-button'
import { toast } from "sonner"
import { LoaderCircle } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { User } from '@supabase/supabase-js'
import { LinkFormFields } from '@/components/link-form-fields' // 引入新组件
import { LinkArrowIcon } from '@/components/link-arrow-icon'

export function ShortenForm({ user }: { user: User | null }) {
    const router = useRouter()

    // 状态管理
    const [url, setUrl] = useState('')
    const [slug, setSlug] = useState('')
    const [isNoIndex, setIsNoIndex] = useState(true)
    const [showCustomOption, setShowCustomOption] = useState(false)

    // 结果与加载状态
    const [shortUrlSlug, setShortUrlSlug] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{ url?: string }>({})
    const [isButtonHovered, setIsButtonHovered] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!user) {
            toast("需要登录", {
                description: "你需要登录以创建短链接",
                action: { label: "登录", onClick: () => router.push('/login') },
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
                // 重置表单
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

                {/* 核心字段组件 */}
                <LinkFormFields
                    url={url}
                    setUrl={setUrl}
                    slug={slug}
                    setSlug={setSlug}
                    isNoIndex={isNoIndex}
                    setIsNoIndex={setIsNoIndex}
                    errors={errors}
                    showCustomOption={showCustomOption}
                    setShowCustomOption={setShowCustomOption}
                />

                <Button
                    disabled={loading}
                    type="submit"
                    className="w-full gap-2"
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
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
