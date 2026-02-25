import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, getArticlesByTag } from "@/lib/media";
import { Calendar, Tag } from "lucide-react";
import { TagSelect } from "@/components/ui/TagSelect";
import { Pagination } from "@/components/ui/Pagination";

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
  return {
    title: `#${decoded} の記事`,
    description: `「${decoded}」タグが付いたメディア記事の一覧です。`,
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const decoded = decodeURIComponent(tag);
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const articles = getArticlesByTag(decoded);
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
            #{decoded}
          </h1>
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full mb-4" />
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <TagSelect tags={allTags} current={decoded} />
          </div>

          {paginatedArticles.length === 0 ? (
            <p className="text-center text-luna-text-secondary">
              該当する記事がありません。
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
                      {article.tags.map((t) => (
                        <span
                          key={t}
                          className={`text-xs ${
                            t === decoded
                              ? "text-luna-gold"
                              : "text-luna-text-secondary"
                          }`}
                        >
                          #{t}
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
            basePath={`/media/tag/${encodeURIComponent(decoded)}`}
          />
        </div>
      </section>
    </>
  );
}
