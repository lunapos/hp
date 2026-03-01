import type { Metadata } from "next";
import { getAllTags, getArticlesByTag } from "@/lib/media";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import ContentCard from "@/components/ui/ContentCard";
import { TagSelect } from "@/components/ui/TagSelect";
import { Pagination } from "@/components/ui/Pagination";
import { getTranslations, setRequestLocale } from "next-intl/server";

const ARTICLES_PER_PAGE = 6;

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const t = await getTranslations('column');
  return {
    title: t('tagTitle', { tag: decoded }),
    description: t('tagDescription', { tag: decoded }),
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, tag } = await params;
  setRequestLocale(locale);
  const { page: pageParam } = await searchParams;
  const decoded = decodeURIComponent(tag);
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const articles = getArticlesByTag(decoded, locale);
  const allTags = getAllTags(locale);
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const t = await getTranslations('column');

  return (
    <Section className="pt-32">
      <SectionHeading subtitle={t('subtitle')} title={`#${decoded}`} />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <TagSelect tags={allTags} current={decoded} />
        </div>

        {paginatedArticles.length === 0 ? (
          <p className="text-center text-luna-text-secondary">
            {t('tagEmpty')}
          </p>
        ) : (
          <div className="space-y-4">
            {paginatedArticles.map((article) => (
              <ContentCard
                key={article.slug}
                href={`/column/${article.slug}`}
                date={article.date}
                title={article.title}
                description={article.description}
                category={article.category}
                tags={article.tags}
              />
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/column/tag/${encodeURIComponent(decoded)}`}
        />
      </div>
    </Section>
  );
}
