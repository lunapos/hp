import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import InvestorSection from "@/components/sections/InvestorSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.investor');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/investor",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/investor",
      type: "website",
    },
  };
}

export default function InvestorPage() {
  return <InvestorSection />;
}
