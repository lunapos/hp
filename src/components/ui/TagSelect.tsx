"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function TagSelect({
  tags,
  current,
}: {
  tags: string[];
  current?: string;
}) {
  const router = useRouter();

  return (
    <div className="relative inline-block">
      <select
        value={current || ""}
        onChange={(e) => {
          const val = e.target.value;
          router.push(
            val ? `/media/tag/${encodeURIComponent(val)}` : "/media"
          );
        }}
        className="appearance-none bg-luna-surface border border-luna-border text-luna-text-secondary rounded-lg pl-4 pr-10 py-2 text-sm focus:border-luna-gold focus:outline-none cursor-pointer hover:border-luna-gold transition-colors"
      >
        <option value="">すべての記事</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            #{tag}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luna-text-secondary pointer-events-none" />
    </div>
  );
}
