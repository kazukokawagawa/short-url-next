'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
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

export function CreateLinkDialog() {
    const [open, setOpen] = useState(false)

    // 包装一下 Action，以便执行完关闭弹窗
    async function clientAction(formData: FormData) {
        await createLink(formData)
        setOpen(false) // 关闭弹窗
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create New Link</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Link</DialogTitle>
                    <DialogDescription>
                        Paste your long URL below to shorten it.
                    </DialogDescription>
                </DialogHeader>

                <form action={clientAction} className="grid gap-4 py-4">
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
                            Slug (Opt)
                        </Label>
                        <Input
                            id="slug"
                            name="slug"
                            placeholder="custom-name"
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}