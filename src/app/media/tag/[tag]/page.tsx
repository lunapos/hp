import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, getArticlesByTag } from "@/lib/media";
import { Calendar, Tag, ArrowLeft } from "lucide-react";

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
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const articles = getArticlesByTag(decoded);
  const allTags = getAllTags();

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
          <Link
            href="/media"
            className="inline-flex items-center gap-1 text-sm text-luna-text-secondary hover:text-luna-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            すべての記事に戻る
          </Link>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* タグフィルター */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <Link
              href="/media"
              className="text-xs px-3 py-1.5 rounded-full border border-luna-border text-luna-text-secondary hover:border-luna-gold hover:text-luna-gold transition-colors"
            >
              すべて
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/media/tag/${encodeURIComponent(t)}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  t === decoded
                    ? "border-luna-gold bg-luna-gold/15 text-luna-gold"
                    : "border-luna-border text-luna-text-secondary hover:border-luna-gold hover:text-luna-gold"
                }`}
              >
                #{t}
              </Link>
            ))}
          </div>

          {articles.length === 0 ? (
            <p className="text-center text-luna-text-secondary">
              該当する記事がありません。
            </p>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
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
        </div>
      </section>
    </>
  );
}
