import { getSiteConfig } from "@/lib/site-config"
import { HomeClient } from "./home-client"

export default async function Home() {
  const siteConfig = await getSiteConfig()

  return (
    <HomeClient
      siteName={siteConfig.name}
      siteDescription={siteConfig.description}
    />
  )
}
