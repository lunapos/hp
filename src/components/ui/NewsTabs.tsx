"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import ContentCard from "@/components/ui/ContentCard";
import type { NewsItem, Project } from "@/data/news";

const PER_PAGE = 6;

type TabKey = "announcements" | "updates";

type FilterKey = "all" | Project;

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
  const t = useTranslations("newsTabs");
  const [activeTab, setActiveTab] = useState<TabKey>(
    defaultTab ?? "updates"
  );
  const [page, setPage] = useState(1);
  const [projectFilter, setProjectFilter] = useState<"all" | Project>("all");

  const TABS: { key: TabKey; label: string }[] = [
    { key: "announcements", label: t("announcements") },
    { key: "updates", label: t("devUpdates") },
  ];

  const PROJECT_FILTERS: { key: "all" | Project; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "HP", label: "HP" },
    { key: "LP", label: "LP" },
    { key: "Floor", label: "Floor" },
    { key: "Admin", label: "Admin" },
    { key: "Cast", label: "Cast" },
  ];

  let filtered = filterByTab(items, activeTab);
  if (activeTab === "updates" && projectFilter !== "all") {
    filtered = filtered.filter((i) => i.project === projectFilter);
  }
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
    setProjectFilter("all");
  };

  return (
    <>
      {/* タブ */}
      <div className="flex gap-1 mb-6 border-b border-luna-border">
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

      {/* プロジェクトフィルター（開発アップデートタブ時のみ） */}
      {activeTab === "updates" && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {PROJECT_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setProjectFilter(f.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-200 ${
                projectFilter === f.key
                  ? "border-luna-gold bg-luna-gold/15 text-luna-gold"
                  : "border-luna-border text-luna-text-secondary hover:border-luna-gold hover:text-luna-gold"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* 一覧 */}
      <div className="space-y-4">
        {paged.map((item) => (
          <ContentCard
            key={item.slug}
            href={`/news/${item.slug}`}
            date={item.date}
            title={item.title}
            description={item.summary}
            project={item.project}
          />
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
