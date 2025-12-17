import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>
                        Enter your email to sign in to your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>

                        {/* Server Actions 的神奇之处：formAction */}
                        <div className="flex flex-col gap-2 mt-4">
                            <Button formAction={login} className="w-full">
                                Log in
                            </Button>
                            <Button formAction={signup} variant="outline" className="w-full">
                                Sign up
                            </Button>
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