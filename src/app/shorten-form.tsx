'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from "framer-motion"
import { CopyButton } from "@/components/copy-button"
import { ActionScale } from "@/components/action-scale"

export function ShortenForm() {
    const [url, setUrl] = useState('')
    const [shortUrlSlug, setShortUrlSlug] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            })
            const data = await res.json()

            if (data.slug) {
                setShortUrlSlug(data.slug)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid w-full items-center gap-4">
            <form onSubmit={handleSubmit} className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="url">需要缩短的URL</Label>
                    <Input
                        id="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <ActionScale>
                    <Button disabled={loading} type="submit" className="w-full">
                        {loading ? '正在生成...' : '生成短链接'}
                    </Button>
                </ActionScale>
            </form>

            <AnimatePresence>
                {shortUrlSlug && (
                    <motion.div
                        // 初始：变小(0.8倍)，透明，向下位移
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        // 进场：恢复原状
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        // 离场：变小消失
                        exit={{ opacity: 0, scale: 0.9 }}
                        // 弹性配置：type: "spring" 会有那种 Q 弹的感觉
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}

                        className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md flex items-center justify-between"
                    >
                        <div className="flex flex-col">
                            <span className="text-xs text-green-600 uppercase font-bold">完成!</span>
                            <span className="font-medium text-sm">
                                {window.location.origin}/{shortUrlSlug}
                            </span>
                        </div>
                        <CopyButton slug={shortUrlSlug} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
