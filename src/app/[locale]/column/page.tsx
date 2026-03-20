import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { getAllArticles, getAllTags } from "@/lib/media";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import ContentCard from "@/components/ui/ContentCard";
import { TagSelect } from "@/components/ui/TagSelect";
import { Pagination } from "@/components/ui/Pagination";

const ARTICLES_PER_PAGE = 6;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.column');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/column",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/column",
      type: "website",
    },
  };
}

export default async function MediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const articles = getAllArticles(locale);
  const allTags = getAllTags(locale);
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const t = await getTranslations('column');

  return (
    <Section className="pt-32">
      <SectionHeading
        subtitle={t('subtitle')}
        title={t('title')}
        description={t('description')}
      />

      <div className="max-w-4xl mx-auto">
        {allTags.length > 0 && (
          <div className="mb-8">
            <TagSelect tags={allTags} />
          </div>
        )}

        {paginatedArticles.length === 0 ? (
          <p className="text-center text-luna-text-secondary">
            {t('empty')}
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
          basePath="/column"
        />
      </div>
    </Section>
  );
}
