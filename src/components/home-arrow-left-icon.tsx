'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface HomeArrowLeftIconProps {
    isHovered?: boolean
}

export function HomeArrowLeftIcon({ isHovered = false }: HomeArrowLeftIconProps) {
    return (
        <div className="relative inline-flex items-center justify-center w-[16px] h-[16px] mr-2">
            <AnimatePresence mode="wait">
                {!isHovered ? (
                    <motion.svg
                        key="home"
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
                        initial={{ opacity: 0, x: 3 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -3 }}
                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                    >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </motion.svg>
                ) : (
                    <motion.svg
                        key="arrow-left"
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
                        initial={{ opacity: 0, x: 3 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -3 }}
                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                    >
                        <path d="M19 12H5" />
                        <path d="m12 19-7-7 7-7" />
                    </motion.svg>
                )}
            </AnimatePresence>
        </div>
    )
}
