import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BASE_DIR = path.join(process.cwd(), "content/column");

function contentDir(locale = "ja"): string {
  // ja は直下、en/zh はサブディレクトリ
  return locale === "ja" ? BASE_DIR : path.join(BASE_DIR, locale);
}

// content/column/{date}/*.mdx を再帰的に収集（en/zh サブディレクトリは除外）
function collectMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // ja の場合、en/zh サブディレクトリは除外
      if (dir === BASE_DIR && (entry.name === "en" || entry.name === "zh")) continue;
      results.push(...collectMdxFiles(path.join(dir, entry.name)));
    } else if (entry.name.endsWith(".mdx")) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  lastModified?: string;
  category: string;
  tags: string[];
  thumbnail?: string;
}

export interface Article extends ArticleMeta {
  content: string;
}

// 公開済みかどうか（dateが今日以前ならtrue）
// Vercelビルド環境はUTCのため、当日末(23:59:59)と比較して
// 時刻部分(T12:00:00等)に関係なく当日の記事を公開する
function isPublished(date: string): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(date) <= today;
}

export function getAllArticles(locale = "ja"): ArticleMeta[] {
  const dir = contentDir(locale);
  const files = collectMdxFiles(dir);
  if (files.length === 0 && locale !== "ja") return getAllArticles("ja"); // フォールバック

  const articles = files
    .map((filePath) => {
      const slug = path.basename(filePath).replace(/\.mdx$/, "");
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);

      return {
        slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        lastModified: data.lastModified || undefined,
        category: data.category || "",
        tags: data.tags || [],
        thumbnail: data.thumbnail,
      } as ArticleMeta;
    })
    .filter((a) => isPublished(a.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return articles;
}

export function getArticle(slug: string, locale = "ja"): Article | null {
  // まず指定ロケールで探す、なければ ja にフォールバック
  const dir = contentDir(locale);
  const files = collectMdxFiles(dir);
  let filePath = files.find((f) => path.basename(f) === `${slug}.mdx`) ?? null;
  if (!filePath && locale !== "ja") {
    const jaFiles = collectMdxFiles(BASE_DIR);
    filePath = jaFiles.find((f) => path.basename(f) === `${slug}.mdx`) ?? null;
  }
  if (!filePath) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  // 未公開記事はnullを返す
  if (!isPublished(data.date || "")) return null;

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: data.date || "",
    lastModified: data.lastModified || undefined,
    category: data.category || "",
    tags: data.tags || [],
    thumbnail: data.thumbnail,
    content,
  };
}

export function getAllSlugs(locale = "ja"): string[] {
  // slug は全言語共通（ja ベース）、公開済みのみ
  return getAllArticles(locale).map((a) => a.slug);
}

/** 指定ロケールに翻訳ファイルが存在するか（ja フォールバックではなく実ファイル） */
export function hasTranslation(slug: string, locale: string): boolean {
  if (locale === "ja") return true;
  const files = collectMdxFiles(contentDir(locale));
  return files.some((f) => path.basename(f) === `${slug}.mdx`);
}

export function getAllTags(locale = "ja"): string[] {
  const articles = getAllArticles(locale);
  const tagSet = new Set<string>();
  for (const article of articles) {
    for (const tag of article.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet);
}

export function getArticlesByTag(tag: string, locale = "ja"): ArticleMeta[] {
  return getAllArticles(locale).filter((article) => article.tags.includes(tag));
}
