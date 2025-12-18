'use client'

import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShortenForm } from "./shorten-form"
import { FadeIn } from "@/components/animations/fade-in"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { TextArrowIcon } from "@/components/text-arrow-icon"
import { SmartLoading } from "@/components/smart-loading"
import { useLoading } from "@/components/providers/loading-provider"

interface HomeClientProps {
    siteName: string
    siteDescription: string
}

export function HomeClient({ siteName, siteDescription }: HomeClientProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [hoveredButton, setHoveredButton] = useState<'login' | 'dashboard' | null>(null)
    const router = useRouter()
    const { isLoading: isGlobalLoading, setIsLoading: setGlobalLoading } = useLoading()

    useEffect(() => {
        async function getUser() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
            setGlobalLoading(false)
        }
        getUser()
    }, [setGlobalLoading])

    if (isGlobalLoading) return null
    if (loading) return <SmartLoading />

    return (
        <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background relative p-4 md:p-24">

            {/* 顶部导航区 */}
            {!loading && (
                <FadeIn delay={0} className="absolute top-6 right-6 md:top-8 md:right-8 z-20">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden md:inline-block">
                                {user.email}
                            </span>
                            <Button
                                size="sm"
                                className="md:h-10 md:px-4 md:py-2 gap-2"
                                onMouseEnter={() => setHoveredButton('dashboard')}
                                onMouseLeave={() => setHoveredButton(null)}
                                onClick={() => {
                                    setGlobalLoading(true)
                                    router.push("/dashboard")
                                }}
                            >
                                <TextArrowIcon isHovered={hoveredButton === 'dashboard'} text="控制台" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onMouseEnter={() => setHoveredButton('login')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => {
                                setGlobalLoading(true)
                                router.push("/login")
                            }}
                        >
                            <TextArrowIcon isHovered={hoveredButton === 'login'} text="登录" />
                        </Button>
                    )}
                </FadeIn>
            )}

            {/* 核心卡片区域 */}
            <div className="w-full max-w-md z-10">
                <Card className="w-full border-0 shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
                    <CardHeader className="text-center pb-2 sm:pb-6">
                        <FadeIn delay={0.1}>
                            <CardTitle className="text-3xl font-extrabold tracking-tight lg:text-4xl">
                                {siteName}
                            </CardTitle>
                        </FadeIn>
                        <FadeIn delay={0.2}>
                            <CardDescription className="text-base mt-2">
                                {siteDescription}
                            </CardDescription>
                        </FadeIn>
                    </CardHeader>
                    <CardContent>
                        <FadeIn delay={0.3}>
                            <ShortenForm user={user} />
                        </FadeIn>
                    </CardContent>
                </Card>
            </div>

        </main>
    )
}
