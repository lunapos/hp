"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectBadge from "@/components/ui/ProjectBadge";
import type { NewsItem } from "@/data/news";

const PER_PAGE = 6;

const TABS = [
  { key: "announcements", label: "お知らせ" },
  { key: "updates", label: "開発アップデート" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function filterByTab(items: NewsItem[], tab: TabKey): NewsItem[] {
  if (tab === "announcements") {
    return items.filter(
      (i) =>
        i.category === "お知らせ" ||
        i.category === "キャンペーン" ||
        i.category === "メンテナンス"
    );
  }
  return items.filter((i) => i.category === "開発アップデート");
}

export default function NewsTabs({
  items,
  defaultTab,
}: {
  items: NewsItem[];
  defaultTab?: TabKey;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>(
    defaultTab ?? "updates"
  );
  const [page, setPage] = useState(1);

  const filtered = filterByTab(items, activeTab);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <>
      {/* タブ */}
      <div className="flex gap-1 mb-8 border-b border-luna-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => switchTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-luna-gold text-luna-gold"
                : "border-transparent text-luna-text-secondary hover:text-luna-text-primary"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs text-luna-text-muted">
              ({filterByTab(items, tab.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* 一覧 */}
      <div className="space-y-4">
        {paged.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${item.slug}`}
            className="block bg-luna-surface border border-luna-border rounded-xl p-6 hover:border-luna-gold transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <div className="flex items-center gap-2 shrink-0">
                <time className="text-luna-text-muted text-sm tabular-nums">
                  {item.date}
                </time>
                {item.project && <ProjectBadge project={item.project} />}
              </div>
              <h2 className="text-luna-text-primary font-medium text-lg group-hover:text-luna-gold transition-colors duration-200">
                {item.title}
              </h2>
            </div>
            <p className="text-luna-text-secondary text-sm leading-relaxed">
              {item.summary}
            </p>
          </Link>
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-luna-border text-luna-text-secondary hover:text-luna-gold hover:border-luna-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                n === page
                  ? "bg-luna-gold text-white"
                  : "border border-luna-border text-luna-text-secondary hover:text-luna-gold hover:border-luna-gold"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-luna-border text-luna-text-secondary hover:text-luna-gold hover:border-luna-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
