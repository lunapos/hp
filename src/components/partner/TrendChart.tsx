"use client";

interface TrendChartProps {
  data: { label: string; value: number }[];
  color?: string;
  title: string;
}

export default function TrendChart({
  data,
  color = "bg-emerald-400",
  title,
}: TrendChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <h3 className="text-luna-text-secondary text-xs font-medium mb-3">
        {title}
      </h3>
      <div className="flex items-end gap-1 h-40">
        {data.map((d, i) => {
          const pct = (d.value / maxValue) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-luna-surface border border-luna-border rounded-lg px-2 py-1 text-xs text-luna-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {d.value}
              </div>
              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full ${color} rounded-t opacity-70 group-hover:opacity-100 transition-all duration-300`}
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
              </div>
              {/* Label */}
              <span className="text-[9px] text-luna-text-secondary truncate w-full text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
