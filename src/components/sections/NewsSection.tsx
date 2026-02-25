import Link from "next/link";
import { ArrowRight, Megaphone, Code } from "lucide-react";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectBadge from "@/components/ui/ProjectBadge";
import { getNewsByCategory } from "@/data/news";
import type { NewsItem } from "@/data/news";

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="block bg-luna-surface border border-luna-border rounded-lg p-4 hover:border-luna-gold transition-all duration-300 group"
    >
      <div className="flex items-center gap-2">
        <time className="text-luna-text-muted text-xs tabular-nums">
          {item.date}
        </time>
        {item.project && <ProjectBadge project={item.project} />}
      </div>
      <h3 className="text-luna-text-primary text-sm font-medium mt-1 group-hover:text-luna-gold transition-colors duration-200 line-clamp-2">
        {item.title}
      </h3>
    </Link>
  );
}

export default function NewsSection() {
  const announcements = getNewsByCategory("お知らせ", 3);
  const updates = getNewsByCategory("開発アップデート", 3);

  return (
    <Section>
      <SectionHeading subtitle="NEWS" title="お知らせ・開発アップデート" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* お知らせ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-400" />
              <h3 className="text-luna-text-primary font-semibold">お知らせ</h3>
            </div>
            <Link
              href="/news?tab=announcements"
              className="inline-flex items-center gap-1 text-luna-gold hover:text-luna-gold-light transition-colors duration-200 text-xs font-medium"
            >
              一覧
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </div>

        {/* 開発アップデート */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-400" />
              <h3 className="text-luna-text-primary font-semibold">
                開発アップデート
              </h3>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-1 text-luna-gold hover:text-luna-gold-light transition-colors duration-200 text-xs font-medium"
            >
              一覧
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {updates.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
