import { PROJECT_LABELS, type Project } from "@/data/news";

export default function ProjectBadge({ project }: { project: Project }) {
  const info = PROJECT_LABELS[project];
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${info.color}`}
    >
      {info.label}
    </span>
  );
}
