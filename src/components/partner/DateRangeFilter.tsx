"use client";

import { useTranslations } from "next-intl";

export type Period = "7d" | "30d" | "90d" | "all";

const PERIOD_KEYS: Period[] = ["7d", "30d", "90d", "all"];

interface DateRangeFilterProps {
  value: Period;
  onChange: (period: Period) => void;
}

export default function DateRangeFilter({
  value,
  onChange,
}: DateRangeFilterProps) {
  const t = useTranslations("dateRange");

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PERIOD_KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            value === key
              ? "border-emerald-400 bg-emerald-400/15 text-emerald-400"
              : "border-luna-border text-luna-text-secondary hover:text-luna-text-primary hover:border-luna-text-secondary"
          }`}
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
}
