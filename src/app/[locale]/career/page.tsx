import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import CareerContent from "./CareerContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.career');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/career",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/career",
      type: "website",
    },
  };
}

export default function CareerPage() {
  return <CareerContent />;
}
