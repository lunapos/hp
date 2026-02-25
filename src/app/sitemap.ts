import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/media";
import { newsItems } from "@/data/news";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lunapos.jp";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/company`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/media`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const articles = getAllArticles();
  const mediaPages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/media/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const newsPages: MetadataRoute.Sitemap = newsItems.map((item) => ({
    url: `${baseUrl}/news/${item.slug}`,
    lastModified: new Date(item.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...mediaPages, ...newsPages];
}
