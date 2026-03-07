import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/media";
import { newsItems } from "@/data/news";
import { routing } from "@/i18n/routing";

const baseUrl = "https://lunapos.jp";
const locales = routing.locales; // ['ja', 'en', 'zh']
const defaultLocale = routing.defaultLocale; // 'ja'

function localizedUrl(path: string, locale: string): string {
  // ja はプレフィックスなし（localePrefix: 'as-needed'）
  return locale === defaultLocale
    ? `${baseUrl}${path}`
    : `${baseUrl}/${locale}${path}`;
}

function withAlternates(path: string, lastModified: Date, opts: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }) {
  return locales.map((locale) => ({
    url: localizedUrl(path, locale),
    lastModified,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, localizedUrl(path, l)])
      ),
    },
  }));
}

/** jaのみのエントリ（en/zh は noindex のためサイトマップに含めない） */
function jaOnly(path: string, lastModified: Date, opts: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }) {
  return [{
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  }];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "monthly", priority: 1 },
    { path: "/features", changeFrequency: "monthly", priority: 0.8 },
    { path: "/company", changeFrequency: "yearly", priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.7 },
    { path: "/news", changeFrequency: "weekly", priority: 0.8 },
    { path: "/column", changeFrequency: "weekly", priority: 0.8 },
    { path: "/career", changeFrequency: "monthly", priority: 0.6 },
    { path: "/fund", changeFrequency: "monthly", priority: 0.5 },
    { path: "/investor", changeFrequency: "monthly", priority: 0.5 },
    { path: "/partner", changeFrequency: "monthly", priority: 0.5 },
    { path: "/roadmap", changeFrequency: "monthly", priority: 0.5 },
    { path: "/world", changeFrequency: "monthly", priority: 0.5 },
    { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/tokushoho", changeFrequency: "yearly", priority: 0.3 },
  ];

  const staticPages = staticPaths.flatMap(({ path, ...opts }) =>
    withAlternates(path, now, opts)
  );

  // コラム: ja のみ（en/zh は noindex なのでサイトマップに含めない）
  const jaArticles = getAllArticles("ja");
  const mediaPages = jaArticles.flatMap((article) =>
    jaOnly(`/column/${article.slug}`, new Date(article.date), {
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const newsPages = newsItems.flatMap((item) =>
    withAlternates(`/news/${item.slug}`, new Date(item.date), {
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  return [...staticPages, ...mediaPages, ...newsPages];
}
