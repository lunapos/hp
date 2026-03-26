import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { localizedAlternates, localizedUrl } from "@/lib/seo";
import FundContent from "./FundContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata.fund');
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates("/fund", locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: localizedUrl("/fund", locale),
      type: "website",
    },
  };
}

export default function FundPage() {
  return <FundContent />;
}
