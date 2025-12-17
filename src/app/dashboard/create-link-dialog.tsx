'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createLink } from "./actions"
import { toast } from "sonner"
import { ActionScale } from "@/components/action-scale"

export function CreateLinkDialog() {
    const [open, setOpen] = useState(false)

    const [loading, setLoading] = useState(false)

    // 包装一下 Action，以便执行完关闭弹窗
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await createLink(formData)

        setLoading(false)

        if (result?.error) {
            toast.error("无法创建链接", {
                description: result.error,
            })
        } else {
            setOpen(false)
            toast.success("链接创建成功!", {
                description: "短链接已准备就绪，可以分享了。",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <ActionScale>
                    <Button>创建新的链接</Button>
                </ActionScale>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>创建新的链接</DialogTitle>
                    <DialogDescription>
                        在此创建你的短链接URL
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right">
                            URL
                        </Label>
                        <Input
                            id="url"
                            name="url"
                            placeholder="https://example.com"
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="slug" className="text-right">
                            后缀 (可选)
                        </Label>
                        <Input
                            id="slug"
                            name="slug"
                            placeholder="custom-name"
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <ActionScale>
                            <LoadingButton loading={loading} type="submit">保存更改</LoadingButton>
                        </ActionScale>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}