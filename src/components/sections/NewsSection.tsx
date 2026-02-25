import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { getLatestNews } from "@/data/news";

const categoryColors: Record<string, string> = {
  "お知らせ": "bg-blue-500/15 text-blue-400",
  "開発アップデート": "bg-emerald-500/15 text-emerald-400",
  "メンテナンス": "bg-amber-500/15 text-amber-400",
  "キャンペーン": "bg-pink-500/15 text-pink-400",
};

export default function NewsSection() {
  const news = getLatestNews(3);

  return (
    <Section>
      <SectionHeading
        subtitle="NEWS"
        title="お知らせ・開発アップデート"
      />

      <div className="space-y-4 mb-8">
        {news.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${item.slug}`}
            className="block bg-luna-surface border border-luna-border rounded-xl p-5 hover:border-luna-gold transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-3 shrink-0">
                <time className="text-luna-text-muted text-sm tabular-nums">
                  {item.date}
                </time>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    categoryColors[item.category] || "bg-luna-border text-luna-text-secondary"
                  }`}
                >
                  {item.category}
                </span>
              </div>
              <h3 className="text-luna-text-primary font-medium group-hover:text-luna-gold transition-colors duration-200">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-luna-gold hover:text-luna-gold-light transition-colors duration-200 text-sm font-medium"
        >
          すべてのお知らせを見る
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}
