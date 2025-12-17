'use client'

import { deleteLink } from "./actions"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function LinksTable({ data }: { data: any[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Short URL</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((link) => (
                    <TableRow key={link.id}>
                        <TableCell className="font-medium">{link.slug}</TableCell>
                        <TableCell className="truncate max-w-[200px]">{link.original_url}</TableCell>
                        <TableCell>{link.clicks}</TableCell>
                        <TableCell className="text-right">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                    // 调用 Server Action 删除
                                    await deleteLink(link.id)
                                }}
                            >
                                Delete
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}