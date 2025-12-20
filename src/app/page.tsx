import { getSiteConfig, getAnnouncementConfig } from "@/lib/site-config"
import { getSiteSettings } from "@/app/dashboard/settings-actions"
import { HomeClient } from "./home-client"

export default async function Home() {
  // 并行获取所有配置，减少数据库往返
  const [siteConfig, announcementConfig, siteSettings] = await Promise.all([
    getSiteConfig(),
    getAnnouncementConfig(),
    getSiteSettings()
  ])

  return (
    <HomeClient
      siteName={siteConfig.name}
      siteDescription={siteConfig.description}
      announcementConfig={announcementConfig}
      allowPublicShorten={siteSettings.allowPublicShorten}
    />
  )
}
