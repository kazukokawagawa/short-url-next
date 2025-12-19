'use client'

import { cn } from '@/lib/utils'

/**
 * 骨架屏组件 - 用于数据加载时的占位显示
 */
export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted",
                className
            )}
            {...props}
        />
    )
}

/**
 * 链接卡片骨架屏
 */
export function LinkCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-4 space-y-3">
            {/* 顶部：短链接 */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            {/* 原始 URL */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-64" />
            </div>
            {/* 底部信息 */}
            <div className="flex items-center gap-4 pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    )
}

/**
 * 设置卡片骨架屏
 */
export function SettingsCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6 space-y-4">
            {/* 标题栏 */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            {/* 内容区 */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                </div>
            </div>
        </div>
    )
}

/**
 * 列表骨架屏
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <LinkCardSkeleton key={i} />
            ))}
        </div>
    )
}
