import type { Metadata } from "next";
import { getAllArticles, getAllTags } from "@/lib/media";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import ContentCard from "@/components/ui/ContentCard";
import { TagSelect } from "@/components/ui/TagSelect";
import { Pagination } from "@/components/ui/Pagination";

const ARTICLES_PER_PAGE = 6;

export const metadata: Metadata = {
  title: "メディア",
  description:
    "ナイト業界の経営に役立つ情報をお届けします。POS導入ガイド、売上管理のコツ、業界トレンドなど。",
};

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const articles = getAllArticles();
  const allTags = getAllTags();
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  return (
    <Section className="pt-32">
      <SectionHeading
        subtitle="MEDIA"
        title="メディア"
        description="ナイト業界の経営に役立つ情報をお届けします"
      />

      <div className="max-w-4xl mx-auto">
        {allTags.length > 0 && (
          <div className="mb-8">
            <TagSelect tags={allTags} />
          </div>
        )}

        {paginatedArticles.length === 0 ? (
          <p className="text-center text-luna-text-secondary">
            記事の準備中です。
          </p>
        ) : (
          <div className="space-y-4">
            {paginatedArticles.map((article) => (
              <ContentCard
                key={article.slug}
                href={`/media/${article.slug}`}
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
          basePath="/media"
        />
      </div>
    </Section>
  );
}
