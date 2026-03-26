import type { MetadataRoute } from "next";
import { getAllArticles, getAllSlugs } from "@/lib/media";
import { newsItems } from "@/data/news";
import { routing } from "@/i18n/routing";

const baseUrl = "https://lunapos.jp";
const locales = routing.locales; // ['ja', 'en', 'zh']
const defaultLocale = routing.defaultLocale; // 'ja'

function localizedUrl(path: string, locale: string): string {
  return locale === defaultLocale
    ? `${baseUrl}${path}`
    : `${baseUrl}/${locale}${path}`;
}

/** 全言語のエントリ + hreflang alternates */
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

/** jaのみのエントリ */
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

  // 静的ページ: 全言語（hreflang付き）
  const staticPages = staticPaths.flatMap(({ path, ...opts }) =>
    withAlternates(path, now, opts)
  );

  // コラム記事: ja は全記事、en/zh は翻訳が存在する記事のみ
  const jaArticles = getAllArticles("ja");
  const enSlugs = new Set(getAllSlugs("en"));
  const zhSlugs = new Set(getAllSlugs("zh"));

  const mediaPages = jaArticles.flatMap((article) => {
    const path = `/column/${article.slug}`;
    const lastMod = new Date(article.date);
    const opts = { changeFrequency: "monthly" as const, priority: 0.7 };
    const hasEn = enSlugs.has(article.slug);
    const hasZh = zhSlugs.has(article.slug);

    if (hasEn && hasZh) {
      // 全言語揃っている → hreflang付きで全言語エントリ
      return withAlternates(path, lastMod, opts);
    }
    // 一部の言語のみ → 存在する言語だけエントリ
    const entries: MetadataRoute.Sitemap = [];
    const availableLocales = ["ja", ...(hasEn ? ["en"] : []), ...(hasZh ? ["zh"] : [])];
    const languages = Object.fromEntries(
      availableLocales.map((l) => [l, localizedUrl(path, l)])
    );
    for (const locale of availableLocales) {
      entries.push({
        url: localizedUrl(path, locale),
        lastModified: lastMod,
        changeFrequency: opts.changeFrequency,
        priority: opts.priority,
        alternates: { languages },
      });
    }
    return entries;
  });

  // ニュース: ja のみ（en/zh は noindex）
  const newsPages = newsItems.flatMap((item) =>
    jaOnly(`/news/${item.slug}`, new Date(item.date), {
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  return [...staticPages, ...mediaPages, ...newsPages];
}
