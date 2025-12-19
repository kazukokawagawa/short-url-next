'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SessionExpiredDialog({
    open,
    onOpenChange
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void
}) {
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false)

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>身份验证已失效</AlertDialogTitle>
                    <AlertDialogDescription>
                        您的登录状态已过期，或者您的账号在别处发生了变更。为了安全起见，请重新登录。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {/* 带动画的登录按钮 */}
                    <AlertDialogAction
                        onClick={() => router.push('/login')}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={() => setIsHovered(true)}
                        onTouchEnd={() => setIsHovered(false)}
                        className="relative overflow-hidden"
                    >
                        <motion.span
                            initial={false}
                            animate={{
                                opacity: isHovered ? 0 : 1,
                                x: isHovered ? -10 : 0
                            }}
                            transition={{ duration: 0.2 }}
                            className="inline-block"
                        >
                            去登录
                        </motion.span>
                        <motion.span
                            initial={false}
                            animate={{
                                opacity: isHovered ? 1 : 0,
                                x: isHovered ? 0 : 10
                            }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            →
                        </motion.span>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
