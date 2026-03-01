import type { Metadata } from "next";
import WorldContent from "./WorldContent";

export const metadata: Metadata = {
  title: "Luna World | 海外展開プログラム",
  description:
    "LunaPosを世界のナイトエンターテインメント業界へ。シンガポール・東南アジアを皮切りにグローバル展開を目指します。",
};

export default function WorldPage() {
  return <WorldContent />;
}
