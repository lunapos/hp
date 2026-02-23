import type { Metadata } from "next";
import CareerContent from "./CareerContent";

export const metadata: Metadata = {
  title: "Luna Career | 求人プラットフォーム構想",
  description:
    "POSデータが変える、ナイトワーク求人のあり方。実績ベースの店舗評価・キャストポートフォリオ・需要予測による採用提案を実現。",
};

export default function CareerPage() {
  return <CareerContent />;
}
