"use client";

import { Globe } from "lucide-react";

export interface ClickBreakdownData {
  page_url: string;
  click_count: number;
}

interface ClickBreakdownProps {
  data: ClickBreakdownData[];
}

export default function ClickBreakdown({ data }: ClickBreakdownProps) {
  if (data.length === 0) {
    return (
      <p className="text-luna-text-secondary text-sm text-center py-6">
        クリックデータがまだありません。
      </p>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.click_count));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-emerald-400" />
        <h3 className="text-luna-text-primary font-bold text-sm">
          ページ別クリック数
        </h3>
      </div>
      {data.map((item, i) => {
        const pct = (item.click_count / maxCount) * 100;
        const path = item.page_url
          ? new URL(item.page_url, "https://lunapos.jp").pathname
          : "/";
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-luna-text-secondary w-24 truncate shrink-0">
              {path}
            </span>
            <div className="flex-1 h-6 bg-luna-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400/30 rounded-full flex items-center"
                style={{ width: `${Math.max(pct, 5)}%` }}
              >
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <span className="text-xs text-luna-text-primary font-medium w-10 text-right shrink-0">
              {item.click_count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
