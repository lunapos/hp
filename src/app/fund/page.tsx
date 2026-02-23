import type { Metadata } from "next";
import FundContent from "./FundContent";

export const metadata: Metadata = {
  title: "Luna Fund | 店舗投資プログラム",
  description:
    "LunaPos導入店舗の経営データをもとに、有望な店舗への出資・融資が可能になるプログラム。事前登録受付中。",
};

export default function FundPage() {
  return <FundContent />;
}
