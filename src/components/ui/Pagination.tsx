import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current <= 3) {
    // 先頭寄り: 1 2 3 4 ... last
    pages.push(2, 3, 4, "...", total);
  } else if (current >= total - 2) {
    // 末尾寄り: 1 ... n-3 n-2 n-1 last
    pages.push("...", total - 3, total - 2, total - 1, total);
  } else {
    // 中間: 1 ... prev cur next ... last
    pages.push("...", current - 1, current, current + 1, "...", total);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (page === 1) return basePath;
    return `${basePath}?page=${page}`;
  };

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="p-2 rounded-lg border border-luna-border text-luna-text-secondary hover:text-luna-gold hover:border-luna-gold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className="p-2 rounded-lg border border-luna-border text-luna-text-secondary opacity-30 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {visiblePages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-sm text-luna-text-secondary"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-luna-gold text-white"
                : "border border-luna-border text-luna-text-secondary hover:text-luna-gold hover:border-luna-gold"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="p-2 rounded-lg border border-luna-border text-luna-text-secondary hover:text-luna-gold hover:border-luna-gold transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="p-2 rounded-lg border border-luna-border text-luna-text-secondary opacity-30 cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
