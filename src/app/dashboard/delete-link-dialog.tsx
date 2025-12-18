'use client'

import { useState } from "react"
import { deleteLink } from "./actions"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { ActionScale } from "@/components/action-scale"
import { SessionExpiredDialog } from "@/components/session-expired-dialog"

export function DeleteLinkDialog({ id, onSuccess }: { id: number, onSuccess?: () => void }) {
    const [open, setOpen] = useState(false)

    const [isDeleting, setIsDeleting] = useState(false)
    // 1. 新增状态
    const [showSessionExpired, setShowSessionExpired] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)

        // 调用 Server Action
        const result = await deleteLink(id)

        // 2. 检查标记
        if (result?.needsLogin) {
            setIsDeleting(false)
            setShowSessionExpired(true) // 🚨 触发弹窗
            return
        }

        if (result?.error) {
            toast.error("Failed to delete", {
                description: result.error
            })
            setIsDeleting(false)
        } else {
            toast.success("链接已删除")
            setIsDeleting(false)
            setOpen(false) // 关闭对话框
            // 调用刷新回调
            if (onSuccess) {
                onSuccess()
            }
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {/* 这里的 variant="ghost" 让按钮平时是透明的，鼠标放上去才有背景 */}
                <ActionScale>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </ActionScale>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>确定删除吗？</AlertDialogTitle>
                    <AlertDialogDescription>
                        此操作无法撤销，这将永久删除此短链接并从服务器中移除所有相关数据。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {/* 取消按钮 */}
                    <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                    {/* 确认删除按钮 - 设为红色样式 */}
                    {/* 确认删除按钮 - 设为红色样式 */}
                    <LoadingButton
                        onClick={(e) => {
                            e.preventDefault() // 阻止默认关闭行为，等待异步操作完成
                            handleDelete()
                        }}
                        loading={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? "删除中..." : "删除"}
                    </LoadingButton>
                </AlertDialogFooter>
            </AlertDialogContent>
            {/* 3. 挂载失效弹窗 */}
            <SessionExpiredDialog
                open={showSessionExpired}
                onOpenChange={setShowSessionExpired}
            />
        </AlertDialog>
    )
}
