'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from 'date-fns'
import { CopyButton } from "@/components/copy-button"
import { motion, AnimatePresence } from "framer-motion"
import { DeleteLinkDialog } from "./delete-link-dialog"
import { CreateLinkDialog } from "./create-link-dialog"
import { Link2 } from "lucide-react"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"

const MotionRow = motion(TableRow)

export function LinksTable({ links }: { links: any[] }) {
    // --- Empty 状态优化 ---
    if (!links?.length) {
        return (
            // 给 Empty 组件外层加一个有质感的容器
            <div className="rounded-lg border-2 border-dashed border-muted/60 bg-muted/10 py-12">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia>
                            <Link2 className="text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>还没有创建链接</EmptyTitle>
                        <EmptyDescription>
                            你的短链接列表是空的。创建一个新的短链接并开始追踪点击数据吧。
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <CreateLinkDialog />
                    </EmptyContent>
                </Empty>
            </div>
        )
    }

    // 获取显示的 Base URL (降级处理，避免 hydration 错误)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '') || 'short.link'

    return (
        // 给表格外层加一个边框和圆角，提升质感
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[250px] py-4 pl-6">短链接</TableHead>
                        <TableHead className="py-4">原始链接</TableHead>
                        <TableHead className="w-[150px] py-4">创建于</TableHead>
                        <TableHead className="w-[100px] py-4 text-center">点击数</TableHead>
                        <TableHead className="w-[100px] py-4 pr-6 text-right">操作</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <AnimatePresence initial={false}>
                        {links.map((link, index) => {
                            const isFirstScreen = index < 10
                            return (
                                <MotionRow
                                    key={link.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isFirstScreen ? { opacity: 1, y: 0 } : undefined}
                                    whileInView={!isFirstScreen ? { opacity: 1, y: 0 } : undefined}
                                    viewport={{ once: true, margin: "0px", amount: 0.2 }}
                                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeOut",
                                        delay: isFirstScreen ? index * 0.05 : 0
                                    }}
                                    className="group hover:bg-muted/30 transition-colors"
                                >
                                    {/* 1. 优化 Short Link 显示 */}
                                    <TableCell className="py-4 pl-6 font-medium">
                                        <a
                                            href={`/${link.slug}`}
                                            target="_blank"
                                            className="text-primary transition-colors hover:underline hover:text-primary/80 flex items-center gap-2"
                                        >
                                            <Link2 className="h-3.5 w-3.5 opacity-70" />
                                            <span className="truncate">
                                                {baseUrl}/{link.slug}
                                            </span>
                                        </a>
                                    </TableCell>

                                    {/* 2. 优化 Original URL */}
                                    <TableCell className="py-4">
                                        <div
                                            className="max-w-[300px] truncate text-muted-foreground group-hover:text-foreground transition-colors"
                                            title={link.original_url}
                                        >
                                            {link.original_url}
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-4 text-muted-foreground text-sm whitespace-nowrap">
                                        {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                                    </TableCell>

                                    <TableCell className="py-4 text-center font-medium">
                                        {link.clicks}
                                    </TableCell>

                                    <TableCell className="py-4 pr-6 text-right">
                                        {/* 3. 优化操作区 */}
                                        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <CopyButton slug={link.slug} />
                                            <DeleteLinkDialog id={link.id} />
                                        </div>
                                    </TableCell>
                                </MotionRow>
                            )
                        })}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </div>
    )
}