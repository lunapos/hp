import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { localizedAlternates, localizedUrl } from "@/lib/seo";
import WorldContent from "./WorldContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata.world');
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates("/world", locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: localizedUrl("/world", locale),
      type: "website",
    },
  };
}

export default function WorldPage() {
  return <WorldContent />;
}
