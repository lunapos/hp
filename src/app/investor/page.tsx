import type { Metadata } from "next";
import InvestorSection from "@/components/sections/InvestorSection";

export const metadata: Metadata = {
  title: "投資・出資をご検討の方へ",
  description:
    "LunaPosでは、事業そのものへの出資と、導入店舗への投資の2つの参画方法をご用意しています。",
};

export default function InvestorPage() {
  return <InvestorSection />;
}
