import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import WorldContent from "./WorldContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.world');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/world",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/world",
      type: "website",
    },
  };
}

export default function WorldPage() {
  return <WorldContent />;
}
