// 型定義は news-types.ts で一元管理（循環参照回避）
export { type Project, PROJECT_LABELS, type NewsItem } from "./news-types";
import type { NewsItem } from "./news-types";

// 開発アップデートとお知らせを別ファイルから集約
import { updateItems } from "./news-updates";
import { announcementItems } from "./news-announcements";

export const newsItems: NewsItem[] = [
  ...updateItems,
  ...announcementItems,
].sort((a, b) => b.date.localeCompare(a.date));

type NewsTranslation = { title: string; summary: string; category: string; content?: string };

let translationsCache: Record<string, Record<string, NewsTranslation>> = {};

async function getTranslations(locale: string): Promise<Record<string, NewsTranslation>> {
  if (locale === "ja") return {};
  if (translationsCache[locale]) return translationsCache[locale];
  try {
    if (locale === "en") {
      const { newsTranslationsEn } = await import("./news-en");
      translationsCache[locale] = newsTranslationsEn;
      return newsTranslationsEn;
    }
    if (locale === "zh") {
      const { newsTranslationsZh } = await import("./news-zh");
      translationsCache[locale] = newsTranslationsZh;
      return newsTranslationsZh;
    }
  } catch {
    // 翻訳ファイルがない場合は空
  }
  return {};
}

function localizeItem(item: NewsItem, translations: Record<string, NewsTranslation>): NewsItem {
  const t = translations[item.slug];
  if (!t) return item;
  return {
    ...item,
    title: t.title,
    summary: t.summary,
    // category は原文のまま（フィルタ用）、表示は categoryLabel
    categoryLabel: t.category,
    content: t.content ?? item.content,
  };
}

export function getLocalizedNewsItems(locale: string): Promise<NewsItem[]> {
  return getTranslations(locale).then((t) =>
    newsItems.map((item) => localizeItem(item, t))
  );
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return newsItems.find((item) => item.slug === slug);
}

export async function getLocalizedNewsBySlug(slug: string, locale: string): Promise<NewsItem | undefined> {
  const items = await getLocalizedNewsItems(locale);
  return items.find((item) => item.slug === slug);
}

export function getLatestNews(count: number): NewsItem[] {
  return newsItems.slice(0, count);
}

export function getNewsByCategory(
  category: NewsItem["category"],
  count: number
): NewsItem[] {
  return newsItems.filter((item) => item.category === category).slice(0, count);
}

export async function getLocalizedNewsByCategory(
  category: NewsItem["category"],
  count: number,
  locale: string
): Promise<NewsItem[]> {
  const items = await getLocalizedNewsItems(locale);
  // locale が ja 以外の場合、翻訳されたカテゴリ名で一致しないので原文カテゴリで一旦フィルタ
  if (locale === "ja") {
    return items.filter((item) => item.category === category).slice(0, count);
  }
  // 原文のカテゴリでフィルタしてから翻訳
  const translations = await getTranslations(locale);
  const filtered = newsItems.filter((item) => item.category === category).slice(0, count);
  return filtered.map((item) => localizeItem(item, translations));
}
