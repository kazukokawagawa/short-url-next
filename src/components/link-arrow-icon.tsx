'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface LinkArrowIconProps {
    isHovered?: boolean
}

export function LinkArrowIcon({ isHovered = false }: LinkArrowIconProps) {
    return (
        <div className="relative inline-flex items-center justify-center w-[16px] h-[16px] mr-2">
            <AnimatePresence mode="wait">
                {!isHovered ? (
                    <motion.svg
                        key="link"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </motion.svg>
                ) : (
                    <motion.svg
                        key="arrow"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
