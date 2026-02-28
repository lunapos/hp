import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
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

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
      ))}

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
