import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import ProjectBadge from "@/components/ui/ProjectBadge";
import { newsItems, getNewsBySlug } from "@/data/news";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return newsItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
  };
}

const categoryColors: Record<string, string> = {
  "お知らせ": "bg-blue-500/15 text-blue-400",
  "開発アップデート": "bg-emerald-500/15 text-emerald-400",
  "メンテナンス": "bg-amber-500/15 text-amber-400",
  "キャンペーン": "bg-pink-500/15 text-pink-400",
};

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getNewsBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <Section className="pt-32">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-luna-text-secondary hover:text-luna-gold transition-colors duration-200 text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          お知らせ一覧に戻る
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
              {item.category}
            </span>
            {item.project && <ProjectBadge project={item.project} />}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-luna-text-primary mb-8">
            {item.title}
          </h1>

          <div className="bg-luna-surface border border-luna-border rounded-xl p-6 md:p-8">
            <p className="text-luna-text-secondary leading-relaxed text-base">
              {item.content || item.summary}
            </p>
          </div>
        </article>
      </div>
    </Section>
  );
}
