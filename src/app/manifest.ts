import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site-config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const siteConfig = await getSiteConfig();

    return {
        name: `${siteConfig.name} - ${siteConfig.subtitle}`,
        short_name: siteConfig.name,
        description: siteConfig.description,
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
