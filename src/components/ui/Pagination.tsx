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
    <div className="flex justify-center items-center gap-2 mt-12">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-luna-text-secondary hover:text-luna-gold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          前へ
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${
            page === currentPage
              ? "bg-luna-gold/15 text-luna-gold border border-luna-gold"
              : "text-luna-text-secondary hover:text-luna-gold"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-luna-text-secondary hover:text-luna-gold transition-colors"
        >
          次へ
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
