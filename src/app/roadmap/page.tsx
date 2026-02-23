import type { Metadata } from "next";
import RoadmapSection from "@/components/sections/RoadmapSection";

export const metadata: Metadata = {
  title: "ロードマップ | LunaPos の未来",
  description:
    "LunaPosのロードマップ。POS機能からLuna Career、Luna Fund、Luna Worldへ。ナイト業界のインフラを目指す開発計画。",
};

export default function RoadmapPage() {
  return <RoadmapSection />;
}
