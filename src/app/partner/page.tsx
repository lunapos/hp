import type { Metadata } from "next";
import PartnerContent from "./PartnerContent";

export const metadata: Metadata = {
  title: "アフィリエイトパートナー募集",
  description:
    "LunaPosを紹介して報酬を獲得。ナイト業界に精通したあなたの人脈を活かして、店舗にLunaPosを紹介するだけで紹介報酬をお受け取りいただけます。",
};

export default function PartnerPage() {
  return <PartnerContent />;
}
