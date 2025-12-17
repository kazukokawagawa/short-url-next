'use client'

import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SessionExpiredDialog({
    open,
    onOpenChange
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void
}) {
    const router = useRouter()

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>身份验证已失效</AlertDialogTitle>
                    <AlertDialogDescription>
                        您的登录状态已过期，或者您的账号在别处发生了变更。为了安全起见，请重新登录。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {/* 只有一个确认按钮，点击后跳转登录页 */}
                    <AlertDialogAction
                        onClick={() => router.push('/login')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        去登录
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
