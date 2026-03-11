import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getArticle, getAllArticles } from "@/lib/media";
import { Calendar, ArrowLeft, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Comments from "@/components/Comments";
import { BarChartMDX, LineChartMDX, PieChartMDX } from "@/components/charts";

const mdxComponents = { BarChart: BarChartMDX, LineChart: LineChartMDX, PieChart: PieChartMDX };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticle(slug, locale);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `https://lunapos.jp/column/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://lunapos.jp/column/${slug}`,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.lastModified || article.date,
    },
    ...(locale !== "ja" && { robots: { index: false, follow: true } }),
  };
}

export default async function MediaArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = getArticle(slug, locale);
  if (!article) notFound();

  const t = await getTranslations('column');

  // 前後の記事を取得
  const allArticles = getAllArticles(locale);
  const currentIndex = allArticles.findIndex((a) => a.slug === slug);
  const prevArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
  const nextArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        description={article.description}
        date={article.date}
        lastModified={article.lastModified}
        slug={slug}
        tags={article.tags}
      />
      <BreadcrumbJsonLd title={article.title} slug={slug} />
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/column"
            className="inline-flex items-center gap-1 text-sm text-luna-text-secondary hover:text-luna-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToList')}
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs bg-luna-gold/15 text-luna-gold px-3 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-xs text-luna-text-secondary flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {article.date.slice(0, 10)}
              {article.lastModified && article.lastModified !== article.date && (
                <>（更新: {article.lastModified.slice(0, 10)}）</>
              )}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-luna-text-primary mb-4">
            {article.title}
          </h1>

          {article.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3 h-3 text-luna-text-secondary" />
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/column/tag/${encodeURIComponent(tag)}`}
                  className="text-xs text-luna-text-secondary hover:text-luna-gold transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-20 px-4">
        <article className="max-w-3xl mx-auto prose prose-invert prose-luna">
          <MDXRemote source={article.content} components={mdxComponents} />
        </article>

        {/* 前後の記事ナビゲーション */}
        <nav className="max-w-3xl mx-auto mt-10 flex items-stretch gap-4">
          {prevArticle ? (
            <Link
              href={`/column/${prevArticle.slug}`}
              className="flex-1 group flex items-center gap-3 p-4 rounded-xl border border-luna-border hover:border-luna-gold/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-luna-text-muted group-hover:text-luna-gold shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-luna-text-muted">{t('prevArticle')}</div>
                <div className="text-sm text-luna-text-secondary group-hover:text-luna-gold truncate">{prevArticle.title}</div>
              </div>
            </Link>
          ) : <div className="flex-1" />}
          {nextArticle ? (
            <Link
              href={`/column/${nextArticle.slug}`}
              className="flex-1 group flex items-center justify-end gap-3 p-4 rounded-xl border border-luna-border hover:border-luna-gold/50 transition-colors text-right"
            >
              <div className="min-w-0">
                <div className="text-xs text-luna-text-muted">{t('nextArticle')}</div>
                <div className="text-sm text-luna-text-secondary group-hover:text-luna-gold truncate">{nextArticle.title}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-luna-text-muted group-hover:text-luna-gold shrink-0" />
            </Link>
          ) : <div className="flex-1" />}
        </nav>

        {/* コメント */}
        <div className="max-w-3xl mx-auto">
          <Comments project="luna" articleSlug={slug} />
        </div>

        <div className="max-w-3xl mx-auto mt-6 pt-6 border-t border-luna-border">
          <Link
            href="/column"
            className="inline-flex items-center gap-1 text-sm text-luna-text-secondary hover:text-luna-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToList')}
          </Link>
        </div>
      </section>
    </>
  );
}
