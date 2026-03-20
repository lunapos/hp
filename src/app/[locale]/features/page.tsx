import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import FeaturesContent from "./FeaturesContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.features');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/features",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/features",
      type: "website",
    },
  };
}

export default function FeaturesPage() {
  return <FeaturesContent />;
}
