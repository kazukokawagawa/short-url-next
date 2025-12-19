'use client'

import { QRCodeSVG } from 'qrcode.react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useRef } from "react"

interface QRCodeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    url: string
    slug: string
}

/**
 * 二维码弹窗组件
 */
export function QRCodeDialog({ open, onOpenChange, url, slug }: QRCodeDialogProps) {
    const qrRef = useRef<HTMLDivElement>(null)

    const handleDownload = () => {
        if (!qrRef.current) return

        const svg = qrRef.current.querySelector('svg')
        if (!svg) return

        // 创建 canvas 来转换 SVG 为 PNG
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const img = new Image()

        img.onload = () => {
            canvas.width = 256
            canvas.height = 256
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, 256, 256)

            const pngUrl = canvas.toDataURL('image/png')
            const link = document.createElement('a')
            link.download = `qrcode-${slug}.png`
            link.href = pngUrl
            link.click()
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[320px]">
                <DialogHeader>
                    <DialogTitle className="text-center">二维码</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                    {/* 二维码 */}
                    <div
                        ref={qrRef}
                        className="p-4 bg-white rounded-lg shadow-sm"
                    >
                        <QRCodeSVG
                            value={url}
                            size={200}
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    {/* 链接显示 */}
                    <p className="text-sm text-muted-foreground text-center break-all px-4">
                        {url}
                    </p>

                    {/* 下载按钮 */}
                    <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="w-full gap-2"
                    >
                        <Download className="h-4 w-4" />
                        下载二维码
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
