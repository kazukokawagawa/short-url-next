'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DecorativeShapesProps {
    className?: string
    variant?: 'home' | 'login'
}

/**
 * 装饰性 SVG 图形组件
 * 在首页和登录页共享使用
 */
export function DecorativeShapes({ className, variant = 'home' }: DecorativeShapesProps) {
    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none -z-5", className)}>
            {/* 左上角装饰圆 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute -top-20 -left-20 w-80 h-80"
            >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                        </linearGradient>
                    </defs>
                    <circle cx="100" cy="100" r="90" fill="url(#gradient1)" />
                </svg>
            </motion.div>

            {/* 右上角装饰环 */}
            <motion.div
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="absolute -top-10 -right-10 w-60 h-60"
            >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="1"
                        strokeOpacity="0.12"
                        strokeDasharray="10 5"
                    />
                </svg>
            </motion.div>

            {/* 右下角装饰圆 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="absolute -bottom-32 -right-32 w-96 h-96"
            >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                        <radialGradient id="gradient2" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="100" cy="100" r="95" fill="url(#gradient2)" />
                </svg>
            </motion.div>

            {/* 左下角小装饰点 */}
            {variant === 'home' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="absolute bottom-20 left-10 w-4 h-4 rounded-full bg-primary/20"
                />
            )}

            {/* 浮动的小圆点装饰 */}
            <motion.div
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-primary/15"
            />

            <motion.div
                animate={{
                    y: [0, 10, 0],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute bottom-1/3 left-1/4 w-3 h-3 rounded-full bg-primary/10"
            />
        </div>
    )
}
