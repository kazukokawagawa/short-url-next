'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface MailSendIconProps {
    isHovered?: boolean
}

export function MailSendIcon({ isHovered = false }: MailSendIconProps) {
    return (
        <div className="relative inline-flex items-center justify-center w-[18px] h-[18px] mr-2">
            <AnimatePresence mode="wait">
                {!isHovered ? (
                    <motion.svg
                        key="mail"
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
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </motion.svg>
                ) : (
                    <motion.svg
                        key="send"
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
                        <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                        <path d="m21.854 2.147-10.94 10.939" />
                    </motion.svg>
                )}
            </AnimatePresence>
        </div>
    )
}
