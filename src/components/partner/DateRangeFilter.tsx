"use client";

export type Period = "7d" | "30d" | "90d" | "all";

const PERIODS: { key: Period; label: string }[] = [
  { key: "7d", label: "7日間" },
  { key: "30d", label: "30日間" },
  { key: "90d", label: "90日間" },
  { key: "all", label: "全期間" },
];

interface DateRangeFilterProps {
  value: Period;
  onChange: (period: Period) => void;
}

export default function DateRangeFilter({
  value,
  onChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            value === p.key
              ? "border-emerald-400 bg-emerald-400/15 text-emerald-400"
              : "border-luna-border text-luna-text-secondary hover:text-luna-text-primary hover:border-luna-text-secondary"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
