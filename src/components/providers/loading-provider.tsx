"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react"
import { SmartLoading } from "@/components/smart-loading"

interface LoadingContextType {
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    message: string
    showContent: boolean
    showRefresh: boolean
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [showContent, setShowContent] = useState(false)
    const [showRefresh, setShowRefresh] = useState(false)
    const loadingStartTimeRef = useRef<number | null>(null)
    const timersRef = useRef<NodeJS.Timeout[]>([])

    // 当 isLoading 变化时管理计时器
    useEffect(() => {
        if (isLoading) {
            // 如果之前没有开始时间，或者已经超时，重新开始
            if (!loadingStartTimeRef.current) {
                loadingStartTimeRef.current = Date.now()
                setMessage("")
                setShowContent(false)
                setShowRefresh(false)

                // 设置计时器
                const t1 = setTimeout(() => {
                    setShowContent(true)
                    setMessage("正在加载...")
                }, 1000)

                const t2 = setTimeout(() => setMessage("仍在加载..."), 3000)
                const t3 = setTimeout(() => setMessage("就快好了..."), 6000)
                const t4 = setTimeout(() => setMessage("再等等呗..."), 10000)
                const t5 = setTimeout(() => setMessage("即将完成..."), 14000)
                const t6 = setTimeout(() => {
                    setMessage("x_x")
                    setShowRefresh(true)
                }, 18000)

                timersRef.current = [t1, t2, t3, t4, t5, t6]
            }
            // 如果已有开始时间，说明是页面跳转，保持当前状态
        } else {
            // 清除所有计时器并重置状态
            timersRef.current.forEach(clearTimeout)
            timersRef.current = []
            loadingStartTimeRef.current = null
            setMessage("")
            setShowContent(false)
            setShowRefresh(false)
        }

        return () => {
            // 组件卸载时不清除计时器，让它们继续运行
        }
    }, [isLoading])

    return (
        <LoadingContext.Provider value={{
            isLoading,
            setIsLoading,
            message,
            showContent,
            showRefresh
        }}>
            <SmartLoading visible={isLoading} />
            {children}
        </LoadingContext.Provider>
    )
}

export function useLoading() {
    const context = useContext(LoadingContext)
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider")
    }
    return context
}

