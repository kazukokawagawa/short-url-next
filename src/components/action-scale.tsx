'use client'

import { motion, HTMLMotionProps } from "framer-motion"
import { forwardRef, ReactNode } from "react"

interface ActionScaleProps extends HTMLMotionProps<"div"> {
    children: ReactNode
    disabled?: boolean
}

export const ActionScale = forwardRef<HTMLDivElement, ActionScaleProps>(
    ({ children, disabled, className, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                whileHover={disabled ? {} : { scale: 1.05 }}
                whileTap={disabled ? {} : { scale: 0.95 }}
                className={`inline-block ${className || ''}`}
                {...props}
            >
                {children}
            </motion.div>
        )
    }
)
ActionScale.displayName = "ActionScale"
