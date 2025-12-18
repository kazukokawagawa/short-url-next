'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface TerminalArrowIconProps {
    isHovered?: boolean
}

export function TerminalArrowIcon({ isHovered = false }: TerminalArrowIconProps) {
    return (
        <div className="relative inline-flex items-center justify-center w-[18px] h-[18px] mr-2">
            <AnimatePresence mode="wait">
                {!isHovered ? (
                    <motion.svg
                        key="terminal"
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
                        <path d="M4 17l6-6-6-6" />
                        <path d="M12 19h8" />
                    </motion.svg>
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
