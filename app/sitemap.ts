import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/firestore";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dekketsu-news-sody.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles().catch(() => []);

  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/article/${a.id}`,
    lastModified: a.createdAt.toDate(),
    changeFrequency: "never",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date("2026-03-31"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date("2026-03-31"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...articleUrls,
  ];
}
