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

// 将 shadcn 的 TableRow 转换为 motion 组件
const MotionRow = motion(TableRow)

export function LinksTable({ links }: { links: any[] }) {
    if (!links?.length) {
        return <div className="text-center py-10 text-muted-foreground">No links created yet.</div>
    }

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Short Link</TableHead>
                        <TableHead>Original URL</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <AnimatePresence>
                        {links.map((link, index) => (
                            <MotionRow
                                key={link.id}
                                // 初始状态：透明，向下偏移 20px
                                initial={{ opacity: 0, y: 20 }}
                                // 动画结束状态：完全显示，回正
                                animate={{ opacity: 1, y: 0 }}
                                // 退出状态（如果删除时）：向左滑动消失
                                exit={{ opacity: 0, x: -20 }}
                                // 过渡配置，利用 index 实现“交错”效果 (Stagger)
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <TableCell className="font-medium text-blue-600">
                                    <div className="flex items-center gap-2">
                                        <a href={`/${link.slug}`} target="_blank" className="hover:underline">
                                            /{link.slug}
                                        </a>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[300px] truncate" title={link.original_url}>
                                    {link.original_url}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right">{link.clicks}</TableCell>
                                <TableCell>
                                    <CopyButton slug={link.slug} />
                                </TableCell>
                            </MotionRow>
                        ))}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </div>
    )
}