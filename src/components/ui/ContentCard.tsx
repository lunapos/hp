import Link from "next/link";
import { Calendar } from "lucide-react";
import ProjectBadge from "@/components/ui/ProjectBadge";
import type { Project } from "@/data/news";

interface ContentCardProps {
  href: string;
  date: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  project?: Project;
}

export default function ContentCard({
  href,
  date,
  title,
  description,
  category,
  tags,
  project,
}: ContentCardProps) {
  return (
    <Link
      href={href}
      className="block bg-luna-surface border border-luna-border rounded-xl p-6 transition-all duration-300 hover:border-luna-gold hover:shadow-[0_0_30px_rgba(var(--luna-accent-rgb),0.15)] group"
    >
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {category && (
          <span className="text-xs bg-luna-gold/15 text-luna-gold px-3 py-1 rounded-full font-medium">
            {category}
          </span>
        )}
        {project && <ProjectBadge project={project} />}
        <time className="text-xs text-luna-text-muted flex items-center gap-1 tabular-nums">
          <Calendar className="w-3 h-3" />
          {date}
        </time>
      </div>
      <h2 className="text-lg font-bold text-luna-text-primary mb-2 group-hover:text-luna-gold transition-colors duration-200">
        {title}
      </h2>
      <p className="text-sm text-luna-text-secondary leading-relaxed">
        {description}
      </p>
      {tags && tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {tags.map((tag) => (
            <span key={tag} className="text-xs text-luna-text-secondary">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
