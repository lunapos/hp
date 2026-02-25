import Link from "next/link";
import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { newsItems } from "@/data/news";

export const metadata: Metadata = {
  title: "お知らせ・開発アップデート",
  description:
    "LunaPosの最新情報、開発アップデート、メンテナンス情報をお届けします。",
};

const categoryColors: Record<string, string> = {
  "お知らせ": "bg-blue-500/15 text-blue-400",
  "開発アップデート": "bg-emerald-500/15 text-emerald-400",
  "メンテナンス": "bg-amber-500/15 text-amber-400",
  "キャンペーン": "bg-pink-500/15 text-pink-400",
};

export default function NewsListPage() {
  return (
    <Section className="pt-32">
      <SectionHeading
        subtitle="NEWS"
        title="お知らせ・開発アップデート"
      />

      <div className="space-y-4">
        {newsItems.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${item.slug}`}
            className="block bg-luna-surface border border-luna-border rounded-xl p-6 hover:border-luna-gold transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <div className="flex items-center gap-3 shrink-0">
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
              </div>
              <h2 className="text-luna-text-primary font-medium text-lg group-hover:text-luna-gold transition-colors duration-200">
                {item.title}
              </h2>
            </div>
            <p className="text-luna-text-secondary text-sm leading-relaxed md:pl-0">
              {item.summary}
            </p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
