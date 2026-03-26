import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { localizedAlternates, localizedUrl } from "@/lib/seo";
import InvestorSection from "@/components/sections/InvestorSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata.investor');
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates("/investor", locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: localizedUrl("/investor", locale),
      type: "website",
    },
  };
}

export default function InvestorPage() {
  return <InvestorSection />;
}
