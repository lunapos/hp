import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import ProjectBadge from "@/components/ui/ProjectBadge";
import { newsItems, getLocalizedNewsBySlug } from "@/data/news";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

/** テキスト中の https:// URL をリンクに変換 */
function linkify(text: string): ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} className="text-luna-gold hover:underline" target="_blank" rel="noopener noreferrer">{part}</a>
    ) : (
      part
    )
  );
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

          <div className="bg-luna-surface border border-luna-border rounded-xl p-6 md:p-8">
            <p className="text-luna-text-secondary leading-relaxed text-base whitespace-pre-line">
              {linkify(item.content || item.summary)}
            </p>
          </div>
        </article>
      </div>
    </Section>
  );
}
