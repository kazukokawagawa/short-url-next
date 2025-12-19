'use client'

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Globe, Link2, Palette, Database, Wrench, LoaderCircle, Save, Check, Shield } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { getSettings, saveSettings, AllSettings } from "@/app/admin/actions"
import { SmartLoading } from "@/components/smart-loading"
import { useLoading } from "@/components/providers/loading-provider"

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const { isLoading: isGlobalLoading, setIsLoading: setGlobalLoading } = useLoading()

    const [siteName, setSiteName] = useState("LinkFlow")
    const [siteSubtitle, setSiteSubtitle] = useState("下一代短链接生成器")
    const [siteDescription, setSiteDescription] = useState("让链接更短，让分享更简单")
    const [siteKeywords, setSiteKeywords] = useState("短链接,URL Shortener,Link Management,Next.js")
    const [authorName, setAuthorName] = useState("池鱼")
    const [authorUrl, setAuthorUrl] = useState("https://chiyu.it")
    const [allowPublicShorten, setAllowPublicShorten] = useState(true)

    // 链接设置
    const [slugLength, setSlugLength] = useState<number | "">(6)
    const [enableClickStats, setEnableClickStats] = useState(true)

    // 外观设置
    const [primaryColor, setPrimaryColor] = useState("#7c3aed")
    const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system")

    // 数据管理
    const [autoCleanExpired, setAutoCleanExpired] = useState(false)
    const [expiredDays, setExpiredDays] = useState(90)

    // 维护模式
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    const [maintenanceMessage, setMaintenanceMessage] = useState("")

    // 安全设置
    const [turnstileEnabled, setTurnstileEnabled] = useState(false)
    const [turnstileSiteKey, setTurnstileSiteKey] = useState("")
    const [turnstileSecretKey, setTurnstileSecretKey] = useState("")
    const [safeBrowsingEnabled, setSafeBrowsingEnabled] = useState(false)
    const [safeBrowsingApiKey, setSafeBrowsingApiKey] = useState("")

    useEffect(() => {
        async function loadSettings() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin') {
                router.push("/dashboard")
                return
            }

            // 从数据库加载设置
            const result = await getSettings()
            if (result.data) {
                const settings = result.data
                // 站点配置
                setSiteName(settings.site.name)
                setSiteSubtitle(settings.site.subtitle || "下一代短链接生成器")
                setSiteDescription(settings.site.description)
                setSiteKeywords(settings.site.keywords || "短链接,URL Shortener,Link Management,Next.js")
                setAuthorName(settings.site.authorName || "池鱼")
                setAuthorUrl(settings.site.authorUrl || "https://chiyu.it")
                setAllowPublicShorten(settings.site.allowPublicShorten)
                // 链接设置
                setSlugLength(settings.links.slugLength)
                setEnableClickStats(settings.links.enableClickStats)
                // 外观设置
                setPrimaryColor(settings.appearance.primaryColor)
                setThemeMode(settings.appearance.themeMode)
                // 数据管理
                setAutoCleanExpired(settings.data.autoCleanExpired)
                setExpiredDays(settings.data.expiredDays)
                // 维护模式
                setMaintenanceMode(settings.maintenance.enabled)
                setMaintenanceMessage(settings.maintenance.message)
                // 安全设置
                setTurnstileEnabled(settings.security.turnstileEnabled)
                setTurnstileSiteKey(settings.security.turnstileSiteKey)
                setTurnstileSecretKey(settings.security.turnstileSecretKey)
                setSafeBrowsingEnabled(settings.security.safeBrowsingEnabled ?? false)
                setSafeBrowsingApiKey(settings.security.safeBrowsingApiKey ?? "")
            }

            setLoading(false)
            setGlobalLoading(false)
        }
        loadSettings()
    }, [router, setGlobalLoading])

    const handleSave = async () => {
        // 验证短码长度
        const safeSlugLength = slugLength === "" ? 0 : slugLength
        if (safeSlugLength < 1 || safeSlugLength > 30) {
            toast.error("参数错误", { description: "短码长度必须在 1-30 位之间" })
            return
        }

        // 验证 Turnstile 配置
        if (turnstileEnabled && (!turnstileSiteKey.trim() || !turnstileSecretKey.trim())) {
            toast.error("配置不完整", { description: "启用 Turnstile 时必须填写 Site Key 和 Secret Key" })
            return
        }

        // 验证 Safe Browsing 配置
        if (safeBrowsingEnabled && !safeBrowsingApiKey.trim()) {
            toast.error("配置不完整", { description: "启用 Google Safe Browsing 时必须填写 API Key" })
            return
        }

        setSaving(true)

        const settings: AllSettings = {
            site: {
                name: siteName,
                subtitle: siteSubtitle,
                description: siteDescription,
                keywords: siteKeywords,
                authorName: authorName,
                authorUrl: authorUrl,
                allowPublicShorten: allowPublicShorten
            },
            links: {
                slugLength: safeSlugLength,
                enableClickStats: enableClickStats
            },
            appearance: {
                primaryColor: primaryColor,
                themeMode: themeMode
            },
            data: {
                autoCleanExpired: autoCleanExpired,
                expiredDays: expiredDays
            },
            maintenance: {
                enabled: maintenanceMode,
                message: maintenanceMessage
            },
            security: {
                turnstileEnabled: turnstileEnabled,
                turnstileSiteKey: turnstileSiteKey,
                turnstileSecretKey: turnstileSecretKey,
                safeBrowsingEnabled: safeBrowsingEnabled,
                safeBrowsingApiKey: safeBrowsingApiKey
            }
        }

        const result = await saveSettings(settings)

        if (result.error) {
            toast.error("保存失败", { description: result.error })
            setSaving(false)
            return
        }

        toast.success("设置已保存", {
            description: "页面将自动刷新以应用更改"
        })

        // 延迟刷新页面
        setTimeout(() => {
            window.location.reload()
        }, 1000)
    }

    if (isGlobalLoading) return null
    if (loading) {
        return <SmartLoading />
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* 页面标题 */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center">
                <FadeIn delay={0} className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setLoading(true)
                            router.push("/admin")
                        }}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">系统设置</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            配置站点参数、链接规则和安全策略
                        </p>
                    </div>
                </FadeIn>
            </div>

            <div className="space-y-6">
                {/* 站点配置 */}
                <FadeIn delay={0.1}>
                    <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle>站点配置</CardTitle>
                                    <CardDescription>基本站点信息和公开访问设置</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">站点名称</Label>
                                    <Input
                                        id="siteName"
                                        value={siteName}
                                        onChange={(e) => setSiteName(e.target.value)}
                                        placeholder="输入站点名称"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siteSubtitle">副标题</Label>
                                    <Input
                                        id="siteSubtitle"
                                        value={siteSubtitle}
                                        onChange={(e) => setSiteSubtitle(e.target.value)}
                                        placeholder="如: 下一代短链接生成器"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">站点描述</Label>
                                <Input
                                    id="siteDescription"
                                    value={siteDescription}
                                    onChange={(e) => setSiteDescription(e.target.value)}
                                    placeholder="输入站点描述"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteKeywords">站点关键词</Label>
                                <Input
                                    id="siteKeywords"
                                    value={siteKeywords}
                                    onChange={(e) => setSiteKeywords(e.target.value)}
                                    placeholder="多个关键词用逗号分隔"
                                    autoComplete="off"
                                />
                                <p className="text-xs text-muted-foreground">多个关键词请用英文逗号分隔</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="authorName">作者名称</Label>
                                    <Input
                                        id="authorName"
                                        value={authorName}
                                        onChange={(e) => setAuthorName(e.target.value)}
                                        placeholder="输入作者名称"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="authorUrl">作者链接</Label>
                                    <Input
                                        id="authorUrl"
                                        value={authorUrl}
                                        onChange={(e) => setAuthorUrl(e.target.value)}
                                        placeholder="输入作者个人主页链接"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>允许公开缩短链接</Label>
                                    <p className="text-sm text-muted-foreground">
                                        未登录用户也可以使用短链接服务
                                    </p>
                                </div>
                                <Switch
                                    checked={allowPublicShorten}
                                    onCheckedChange={setAllowPublicShorten}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* 链接设置 */}
                <FadeIn delay={0.2}>
                    <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <Link2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <CardTitle>链接设置</CardTitle>
                                    <CardDescription>短链接生成规则和统计功能</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="slugLength">默认短码长度</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="slugLength"
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={slugLength}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            if (value === "") {
                                                setSlugLength("")
                                            } else {
                                                setSlugLength(Number(value))
                                            }
                                        }}
                                        className="w-24"
                                        autoComplete="off"
                                    />
                                    <span className="text-sm text-muted-foreground">字符 (1-30)</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>启用点击统计</Label>
                                    <p className="text-sm text-muted-foreground">
                                        记录每个链接的点击次数和访问数据
                                    </p>
                                </div>
                                <Switch
                                    checked={enableClickStats}
                                    onCheckedChange={setEnableClickStats}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* 外观设置 */}
                <FadeIn delay={0.3}>
                    <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                                    <Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                </div>
                                <div>
                                    <CardTitle>外观设置</CardTitle>
                                    <CardDescription>自定义站点主题和配色方案</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* 主题色选择 */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>主题色</Label>
                                    <p className="text-sm text-muted-foreground">
                                        自定义站点的主色调
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{primaryColor}</code>
                                    <label className="relative cursor-pointer">
                                        <div
                                            className="h-10 w-10 rounded-lg border-2 border-border hover:border-foreground/50 transition-colors cursor-pointer"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* 主题模式选择 */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>主题模式</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {
                                            themeMode === 'light' ? '始终使用浅色主题' :
                                                themeMode === 'dark' ? '始终使用深色主题' :
                                                    '根据系统设置自动切换'
                                        }
                                    </p>
                                </div>
                                <Select value={themeMode} onValueChange={(value) => setThemeMode(value as "light" | "dark" | "system")}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            <div className="flex items-center gap-2">
                                                <span>☀️</span>
                                                <span>浅色模式</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            <div className="flex items-center gap-2">
                                                <span>🌙</span>
                                                <span>深色模式</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="system">
                                            <div className="flex items-center gap-2">
                                                <span>💻</span>
                                                <span>跟随系统</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* 数据管理 */}
                <FadeIn delay={0.35}>
                    <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                                    <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div>
                                    <CardTitle>数据管理</CardTitle>
                                    <CardDescription>链接数据清理和导出设置</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>自动清理过期链接</Label>
                                    <p className="text-sm text-muted-foreground">
                                        定期删除长时间无点击的链接
                                    </p>
                                </div>
                                <Switch
                                    checked={autoCleanExpired}
                                    onCheckedChange={setAutoCleanExpired}
                                />
                            </div>
                            {autoCleanExpired && (
                                <div className="space-y-2">
                                    <Label htmlFor="expiredDays">过期天数</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="expiredDays"
                                            type="number"
                                            min={30}
                                            max={365}
                                            value={expiredDays}
                                            onChange={(e) => setExpiredDays(Number(e.target.value))}
                                            className="w-24"
                                            autoComplete="off"
                                        />
                                        <span className="text-sm text-muted-foreground">天未被访问则清理</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    导出所有链接
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    清理已过期链接
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* 维护模式 */}
                <FadeIn delay={0.4}>
                    <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                    <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <CardTitle>维护模式</CardTitle>
                                    <CardDescription>临时关闭服务进行维护</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>启用维护模式</Label>
                                    <p className="text-sm text-muted-foreground">
                                        开启后用户将无法访问短链接服务
                                    </p>
                                </div>
                                <Switch
                                    checked={maintenanceMode}
                                    onCheckedChange={setMaintenanceMode}
                                />
                            </div>
                            {maintenanceMode && (
                                <div className="space-y-2">
                                    <Label htmlFor="maintenanceMessage">维护公告</Label>
                                    <Input
                                        id="maintenanceMessage"
                                        value={maintenanceMessage}
                                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                                        placeholder="输入向用户展示的维护信息..."
                                        autoComplete="off"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* 安全设置 */}
                <FadeIn delay={0.45}>
                    <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <CardTitle>安全设置</CardTitle>
                                    <CardDescription>人机验证与链接安全检测配置</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Turnstile 人机验证 */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>启用注册人机验证</Label>
                                    <p className="text-sm text-muted-foreground">
                                        开启后用户注册时需要完成 Turnstile 验证
                                    </p>
                                </div>
                                <Switch
                                    checked={turnstileEnabled}
                                    onCheckedChange={setTurnstileEnabled}
                                />
                            </div>
                            {turnstileEnabled && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="turnstileSiteKey">Site Key</Label>
                                        <Input
                                            id="turnstileSiteKey"
                                            value={turnstileSiteKey}
                                            onChange={(e) => setTurnstileSiteKey(e.target.value)}
                                            placeholder="从 Cloudflare 控制台获取 Site Key"
                                            autoComplete="off"
                                        />
                                        <p className="text-xs text-muted-foreground">前端渲染验证组件时使用</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="turnstileSecretKey">Secret Key</Label>
                                        <Input
                                            id="turnstileSecretKey"
                                            type="password"
                                            value={turnstileSecretKey}
                                            onChange={(e) => setTurnstileSecretKey(e.target.value)}
                                            placeholder="从 Cloudflare 控制台获取 Secret Key"
                                            autoComplete="off"
                                        />
                                        <p className="text-xs text-muted-foreground">后端验证 token 时使用，请妥善保管</p>
                                    </div>
                                </>
                            )}

                            {/* 分隔线 */}
                            <div className="border-t my-2" />

                            {/* Google Safe Browsing */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>启用 Google Safe Browsing</Label>
                                    <p className="text-sm text-muted-foreground">
                                        创建短链接时检测目标 URL 是否为恶意网址
                                    </p>
                                </div>
                                <Switch
                                    checked={safeBrowsingEnabled}
                                    onCheckedChange={setSafeBrowsingEnabled}
                                />
                            </div>
                            {safeBrowsingEnabled && (
                                <div className="space-y-2">
                                    <Label htmlFor="safeBrowsingApiKey">API Key</Label>
                                    <Input
                                        id="safeBrowsingApiKey"
                                        type="password"
                                        value={safeBrowsingApiKey}
                                        onChange={(e) => setSafeBrowsingApiKey(e.target.value)}
                                        placeholder="从 Google Cloud Console 获取 API Key"
                                        autoComplete="off"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        在 <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a> 创建 API Key 并启用 Safe Browsing API
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>

            {/* 固定在右下角的保存按钮 */}
            <FadeIn delay={0.5}>
                <div className="fixed bottom-8 right-8">
                    <Button
                        onClick={handleSave}
                        size="lg"
                        className="shadow-lg group"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                保存中...
                            </>
                        ) : (
                            <>
                                <span className="relative mr-2 w-4 h-4 inline-flex items-center justify-center">
                                    <Save className="absolute h-4 w-4 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] group-hover:opacity-0 group-hover:scale-50" />
                                    <Check className="absolute h-4 w-4 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100" />
                                </span>
                                保存所有设置
                            </>
                        )}
                    </Button>
                </div>
            </FadeIn>
        </div>
    )
}
