import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import FundContent from "./FundContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.fund');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/fund",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/fund",
      type: "website",
    },
  };
}

export default function FundPage() {
  return <FundContent />;
}
