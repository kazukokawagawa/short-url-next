'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInProps {
    children: ReactNode
    delay?: number
    duration?: number
    className?: string
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.5,
    className
}: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1.0]
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
