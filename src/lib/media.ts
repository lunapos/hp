import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BASE_DIR = path.join(process.cwd(), "content/column");

function contentDir(locale = "ja"): string {
  // ja は直下、en/zh はサブディレクトリ
  return locale === "ja" ? BASE_DIR : path.join(BASE_DIR, locale);
}

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  thumbnail?: string;
}

export interface Article extends ArticleMeta {
  content: string;
}

// 公開済みかどうか（dateが今日以前ならtrue）
function isPublished(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) <= today;
}

export function getAllArticles(locale = "ja"): ArticleMeta[] {
  const dir = contentDir(locale);
  if (!fs.existsSync(dir)) return getAllArticles("ja"); // フォールバック

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  if (files.length === 0 && locale !== "ja") return getAllArticles("ja");

  const articles = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(dir, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);

      return {
        slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
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
  let filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    if (locale !== "ja") {
      filePath = path.join(BASE_DIR, `${slug}.mdx`);
      if (!fs.existsSync(filePath)) return null;
    } else {
      return null;
    }
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  // 未公開記事はnullを返す
  if (!isPublished(data.date || "")) return null;

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: data.date || "",
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
