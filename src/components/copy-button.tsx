"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
export function CopyButton({ slug }: { slug: string }) { // 改为接收 slug
    const [hasCopied, setHasCopied] = useState(false)

    const onCopy = () => {
        // 动态获取当前域名 (例如 http://localhost:3000 或 https://你的域名.com)
        const fullUrl = `${window.location.origin}/${slug}`

        navigator.clipboard.writeText(fullUrl)
        setHasCopied(true)
        setTimeout(() => setHasCopied(false), 2000)
    }

    return (
        <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 relative"
            onClick={onCopy}
        >
            <span className="sr-only">Copy</span>
            {/* 这是一个常用的交互技巧：通过条件渲染切换图标 */}
            {hasCopied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4 text-gray-500" />
            )}
        </Button>
    )
}