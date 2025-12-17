'use client'

import { motion, HTMLMotionProps } from "framer-motion"
import { forwardRef, ReactNode } from "react"

interface ActionScaleProps extends HTMLMotionProps<"div"> {
    children: ReactNode
}

export const ActionScale = forwardRef<HTMLDivElement, ActionScaleProps>(
    ({ children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
                {...props}
            >
                {children}
            </motion.div>
        )
    }
)
ActionScale.displayName = "ActionScale"
