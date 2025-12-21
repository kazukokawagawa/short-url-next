import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
        <div
            className={cn("opacity-0 animate-fade-in-up", className)}
            style={{
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                animationFillMode: 'forwards'
            }}
        >
            {children}
        </div>
    )
}
