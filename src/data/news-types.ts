export type Project = "HP" | "LP" | "Floor" | "Admin" | "Cast";

export const PROJECT_LABELS: Record<Project, { label: string; color: string }> =
  {
    HP: { label: "HP", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    LP: { label: "LP", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    Floor: { label: "Floor", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    Admin: { label: "Admin", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    Cast: { label: "Cast", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  };

export interface NewsItem {
  slug: string;
  date: string;
  title: string;
  summary: string;
  category: "お知らせ" | "開発アップデート" | "メンテナンス" | "キャンペーン";
  categoryLabel?: string;
  project?: Project;
  content?: string;
}
