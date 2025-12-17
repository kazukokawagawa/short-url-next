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
import { CopyButton } from "@/components/copy-button" // 引入新组件

export function LinksTable({ links }: { links: any[] }) {
    if (!links?.length) {
        return <div className="text-center py-10 text-muted-foreground">No links created yet.</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Short Link</TableHead>
                        <TableHead>Original URL</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        {/* 新增一列给操作按钮 */}
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {links.map((link) => (
                        <TableRow key={link.id}>
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
                            {/* 放置复制按钮 */}
                            <TableCell>
                                <CopyButton slug={link.slug} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}