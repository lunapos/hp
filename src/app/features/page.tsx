import type { Metadata } from "next";
import FeaturesContent from "./FeaturesContent";

export const metadata: Metadata = {
  title: "機能紹介",
  description:
    "LunaPos Floorの全機能をご紹介。フロア管理、オーダー管理、会計、キャスト出退勤管理、日報・売上レポートなど。",
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}
