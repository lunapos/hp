import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { localizedAlternates, localizedUrl } from "@/lib/seo";
import FeaturesContent from "./FeaturesContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata.features');
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates("/features", locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: localizedUrl("/features", locale),
      type: "website",
    },
  };
}

export default function FeaturesPage() {
  return <FeaturesContent />;
}
