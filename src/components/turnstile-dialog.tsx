'use client'

import { Turnstile } from '@marsidev/react-turnstile'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { LoaderCircle, ShieldCheck, ShieldX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TurnstileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    siteKey: string
    onSuccess: (token: string) => void
    onError?: () => void
}

export function TurnstileDialog({
    open,
    onOpenChange,
    siteKey,
    onSuccess,
    onError
}: TurnstileDialogProps) {
    const [status, setStatus] = useState<'loading' | 'ready' | 'verifying' | 'success' | 'error'>('loading')
    const [widgetKey, setWidgetKey] = useState(0)

    const handleSuccess = (token: string) => {
        setStatus('success')
        // 短暂延迟后关闭弹窗并回调
        setTimeout(() => {
            onSuccess(token)
            onOpenChange(false)
            // 重置状态
            setStatus('loading')
        }, 800)
    }

    const handleError = () => {
        setStatus('error')
        onError?.()
    }

    const handleExpire = () => {
        setStatus('ready')
    }

    const handleRetry = () => {
        setStatus('loading')
        setWidgetKey(prev => prev + 1) // 重新渲染 widget
    }

    const handleClose = () => {
        onOpenChange(false)
        setStatus('loading')
        setWidgetKey(prev => prev + 1)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        Are You A Robot?
                    </DialogTitle>
                    <DialogDescription>
                        请完成以下验证以继续注册
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-4 min-h-[150px]">
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center gap-3 text-green-500"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <ShieldCheck className="h-12 w-12" />
                                </motion.div>
                                <span className="font-medium">验证成功</span>
                            </motion.div>
                        ) : status === 'error' ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="flex flex-col items-center gap-2 text-destructive">
                                    <ShieldX className="h-12 w-12" />
                                    <span className="font-medium">验证失败</span>
                                </div>
                                <Button variant="outline" onClick={handleRetry}>
                                    重新验证
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="turnstile"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-3"
                            >
                                {status === 'loading' && (
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">加载验证组件...</span>
                                    </div>
                                )}
                                <Turnstile
                                    key={widgetKey}
                                    siteKey={siteKey}
                                    onSuccess={handleSuccess}
                                    onError={handleError}
                                    onExpire={handleExpire}
                                    onWidgetLoad={() => setStatus('ready')}
                                    options={{
                                        theme: 'auto',
                                        language: 'zh-CN'
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-end">
                    <Button variant="ghost" onClick={handleClose}>
                        取消
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
