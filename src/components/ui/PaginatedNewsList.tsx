"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NewsItem } from "@/data/news";

const PER_PAGE = 6;

export default function PaginatedNewsList({ items }: { items: NewsItem[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / PER_PAGE);
  const paged = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <div className="space-y-4">
        {paged.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${item.slug}`}
            className="block bg-luna-surface border border-luna-border rounded-xl p-6 hover:border-luna-gold transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <time className="text-luna-text-muted text-sm tabular-nums shrink-0">
                {item.date}
              </time>
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
