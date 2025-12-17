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
import { cn } from "@/lib/utils"

export function LinksTable({ links }: { links: any[] }) {
    if (!links?.length) {
        return <div className="text-center py-10 text-muted-foreground">没有任何链接被创建</div>
    }

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>短链接</TableHead>
                        <TableHead>原始链接</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead className="text-right">点击次数</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <AnimatePresence>
                        {links.map((link, index) => (
                            <motion.tr
                                key={link.id}
                                className={cn(
                                    "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                )}
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
                                    <div className="flex items-center gap-1">
                                        <CopyButton slug={link.slug} />
                                        <DeleteLinkDialog id={link.id} />
                                    </div>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </div>
    )
}