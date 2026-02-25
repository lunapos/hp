import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, getAllTags } from "@/lib/media";
import { Calendar, Tag } from "lucide-react";
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
    <>
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
            MEDIA
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            メディア
          </h1>
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            ナイト業界の経営に役立つ情報をお届けします
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
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
            <div className="space-y-6">
              {paginatedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/media/${article.slug}`}
                  className="block bg-luna-surface border border-luna-border rounded-xl p-6 transition-all duration-300 hover:border-luna-gold hover:shadow-[0_0_30px_rgba(212,184,112,0.15)] hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs bg-luna-gold/15 text-luna-gold px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-luna-text-secondary flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {article.title}
                  </h2>
                  <p className="text-sm text-luna-text-secondary leading-relaxed mb-3">
                    {article.description}
                  </p>
                  {article.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-3 h-3 text-luna-text-secondary" />
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-luna-text-secondary"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/media"
          />
        </div>
      </section>
    </>
  );
}
