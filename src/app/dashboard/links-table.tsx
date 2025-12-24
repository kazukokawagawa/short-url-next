'use client'

import { LinkCard } from "./link-card"
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

export interface Link {
    id: number
    slug: string
    original_url: string
    created_at: string
    expires_at?: string | null // Add expiration field
    clicks: number
    user_email?: string
}

export function LinksTable({
    links,
    isAdmin = false,
    onDeleteSuccess,
    showClickStats = true,
    showCreator = false
}: {
    links: Link[]
    isAdmin?: boolean
    onDeleteSuccess?: () => void
    showClickStats?: boolean
    showCreator?: boolean
}) {
    // Empty 状态
    if (!links?.length) {
        return (
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
                        <CreateLinkDialog onSuccess={onDeleteSuccess} />
                    </EmptyContent>
                </Empty>
            </div>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link, index) => (
                <LinkCard
                    key={link.id}
                    link={link}
                    isAdmin={isAdmin}
                    onDeleteSuccess={onDeleteSuccess}
                    index={index}
                    showClickStats={showClickStats}
                    showCreator={showCreator}
                />
            ))}
        </div>
    )
}