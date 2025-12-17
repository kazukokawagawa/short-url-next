import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

import { ActionScale } from "@/components/action-scale"

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">欢迎回来</CardTitle>
                    <CardDescription>
                        输入你的账户以登陆控制台
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">邮箱</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="username@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">密码</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>

                        {/* Server Actions 的神奇之处：formAction */}
                        <div className="flex flex-col gap-2 mt-4">
                            <ActionScale>
                                <Button formAction={login} className="w-full">
                                    登录
                                </Button>
                            </ActionScale>
                            <ActionScale>
                                <Button formAction={signup} variant="outline" className="w-full">
                                    注册
                                </Button>
                            </ActionScale>
                        </div>

                        {searchParams?.message && (
                            <p className="mt-4 text-center text-sm text-red-500 bg-red-50 p-2 rounded">
                                {searchParams.message}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}