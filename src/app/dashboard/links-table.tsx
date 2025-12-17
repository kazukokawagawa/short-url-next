'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from 'date-fns'

export function LinksTable({ links }: { links: any[] }) {
    if (!links || links.length === 0) {
        return <div className="text-center py-10 text-gray-500">No links created yet.</div>
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {links.map((link) => (
                        <TableRow key={link.id}>
                            <TableCell className="font-medium text-blue-600">
                                <a href={`/${link.slug}`} target="_blank">
                                    /{link.slug}
                                </a>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate" title={link.original_url}>
                                {link.original_url}
                            </TableCell>
                            <TableCell>
                                {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">{link.clicks}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}