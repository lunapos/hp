import type { Metadata } from "next";
import RoadmapSection from "@/components/sections/RoadmapSection";

export const metadata: Metadata = {
  title: "開発ロードマップ",
  description:
    "LunaPosの開発ロードマップ。POS機能の開発を軸に、Luna Career、Luna Fund、Luna Worldへ段階的に拡張。",
};

export default function RoadmapPage() {
  return <RoadmapSection />;
}
