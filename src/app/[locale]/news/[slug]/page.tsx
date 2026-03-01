import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import ProjectBadge from "@/components/ui/ProjectBadge";
import { newsItems, getLocalizedNewsBySlug, getLocalizedNewsItems } from "@/data/news";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

/** 簡易マークダウンをReactノードに変換 */
function renderMarkdown(text: string): ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lines = text.split("\n");

  return lines.map((line, i) => {
    const trimmed = line.trimStart();

    // 見出し
    if (trimmed.startsWith("### ")) {
      return <h3 key={i} className="text-lg font-bold text-luna-text-primary mt-6 mb-2">{trimmed.slice(4)}</h3>;
    }
    if (trimmed.startsWith("## ")) {
      return <h2 key={i} className="text-xl font-bold text-luna-text-primary mt-8 mb-3">{trimmed.slice(3)}</h2>;
    }

    // リスト項目（・や - で始まる行）
    if (trimmed.startsWith("・") || trimmed.startsWith("- ")) {
      const content = trimmed.startsWith("・") ? trimmed.slice(1).trim() : trimmed.slice(2).trim();
      return <li key={i} className="text-luna-text-secondary ml-4 list-disc">{content}</li>;
    }

    // 空行
    if (trimmed === "") {
      return <br key={i} />;
    }

    // 通常テキスト（URL をリンク化）
    const parts = line.split(urlRegex);
    const nodes = parts.map((part, j) =>
      urlRegex.test(part) ? (
        <a key={j} href={part} className="text-luna-gold hover:underline" target="_blank" rel="noopener noreferrer">{part}</a>
      ) : (
        part
      )
    );
    return <p key={i} className="text-luna-text-secondary leading-relaxed">{nodes}</p>;
  });
}

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return newsItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await getLocalizedNewsBySlug(slug, locale);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
  };
}

// category は常に日本語原文キー
const categoryColors: Record<string, string> = {
  "お知らせ": "bg-blue-500/15 text-blue-400",
  "開発アップデート": "bg-emerald-500/15 text-emerald-400",
  "メンテナンス": "bg-amber-500/15 text-amber-400",
  "キャンペーン": "bg-pink-500/15 text-pink-400",
};

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = await getLocalizedNewsBySlug(slug, locale);

  if (!item) {
    notFound();
  }

  const t = await getTranslations('news');

  // 前後の記事を取得
  const allItems = await getLocalizedNewsItems(locale);
  const currentIndex = allItems.findIndex((n) => n.slug === slug);
  const prevItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;
  const nextItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;

  return (
    <Section className="pt-32">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-luna-text-secondary hover:text-luna-gold transition-colors duration-200 text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToList')}
        </Link>

        <article>
          <div className="flex items-center gap-3 mb-4">
            <time className="text-luna-text-muted text-sm tabular-nums">
              {item.date}
            </time>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                categoryColors[item.category] ||
                "bg-luna-border text-luna-text-secondary"
              }`}
            >
              {item.categoryLabel || item.category}
            </span>
            {item.project && <ProjectBadge project={item.project} />}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-luna-text-primary mb-8">
            {item.title}
          </h1>

          <div className="bg-luna-surface border border-luna-border rounded-xl p-6 md:p-8 space-y-1">
            {renderMarkdown(item.content || item.summary)}
          </div>
        </article>

        {/* 前後の記事ナビゲーション */}
        <nav className="mt-10 flex items-stretch gap-4">
          {prevItem ? (
            <Link
              href={`/news/${prevItem.slug}`}
              className="flex-1 group flex items-center gap-3 p-4 rounded-xl border border-luna-border hover:border-luna-gold/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-luna-text-muted group-hover:text-luna-gold shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-luna-text-muted">{t('prevArticle')}</div>
                <div className="text-sm text-luna-text-secondary group-hover:text-luna-gold truncate">{prevItem.title}</div>
              </div>
            </Link>
          ) : <div className="flex-1" />}
          {nextItem ? (
            <Link
              href={`/news/${nextItem.slug}`}
              className="flex-1 group flex items-center justify-end gap-3 p-4 rounded-xl border border-luna-border hover:border-luna-gold/50 transition-colors text-right"
            >
              <div className="min-w-0">
                <div className="text-xs text-luna-text-muted">{t('nextArticle')}</div>
                <div className="text-sm text-luna-text-secondary group-hover:text-luna-gold truncate">{nextItem.title}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-luna-text-muted group-hover:text-luna-gold shrink-0" />
            </Link>
          ) : <div className="flex-1" />}
        </nav>
      </div>
    </Section>
  );
}
