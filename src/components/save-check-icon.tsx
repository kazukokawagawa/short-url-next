'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SaveCheckIconProps {
    isHovered?: boolean
}

export function SaveCheckIcon({ isHovered = false }: SaveCheckIconProps) {
    return (
        <div className="relative inline-flex items-center justify-center w-[16px] h-[16px] mr-2">
            <AnimatePresence mode="wait">
                {!isHovered ? (
                    <motion.svg
                        key="save"
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
                        <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                        <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                        <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                    </motion.svg>
                ) : (
                    <motion.svg
                        key="check"
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
                        <path d="M20 6 9 17l-5-5" />
                    </motion.svg>
                )}
            </AnimatePresence>
        </div>
    )
}
