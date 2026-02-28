import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getArticle } from "@/lib/media";
import { Calendar, ArrowLeft, Tag } from "lucide-react";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
  };
}

export default async function MediaArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/column"
            className="inline-flex items-center gap-1 text-sm text-luna-text-secondary hover:text-luna-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            コラム一覧に戻る
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs bg-luna-gold/15 text-luna-gold px-3 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-xs text-luna-text-secondary flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {article.date.slice(0, 10)}
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
          <MDXRemote source={article.content} />
        </article>

        <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-luna-border">
          <Link
            href="/column"
            className="inline-flex items-center gap-1 text-sm text-luna-text-secondary hover:text-luna-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            コラム一覧に戻る
          </Link>
        </div>
      </section>
    </>
  );
}
