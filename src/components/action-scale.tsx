'use client'

import { motion } from "framer-motion"
import { ReactNode } from "react"

export function ActionScale({ children }: { children: ReactNode }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }} // 鼠标悬停放大一点点
            whileTap={{ scale: 0.95 }}   // 鼠标按下去缩小一点点（更有点击感）
            className="inline-block"     // 保持内联布局
        >
            {children}
        </motion.div>
    )
}
