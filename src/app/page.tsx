import { getSiteConfig, getAnnouncementConfig } from "@/lib/site-config"
import { HomeClient } from "./home-client"

export default async function Home() {
  const siteConfig = await getSiteConfig()
  const announcementConfig = await getAnnouncementConfig()

  return (
    <HomeClient
      siteName={siteConfig.name}
      siteDescription={siteConfig.description}
      announcementConfig={announcementConfig}
    />
  )
}
