'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface TextArrowIconProps {
    isHovered?: boolean
    text: string
}

export function TextArrowIcon({ isHovered = false, text }: TextArrowIconProps) {
    return (
        <div className="relative inline-flex items-center justify-center min-w-[60px] h-[18px]">
            <AnimatePresence mode="wait">
                {!isHovered ? (
                    <motion.span
                        key="text"
                        className="absolute whitespace-nowrap"
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 3 }}
                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                    >
                        {text}
                    </motion.span>
                ) : (
                    <motion.svg
                        key="arrow"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="absolute"
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 3 }}
                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                    >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </motion.svg>
                )}
            </AnimatePresence>
        </div>
    )
}
