import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { localizedAlternates, localizedUrl } from "@/lib/seo";
import CareerContent from "./CareerContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata.career');
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates("/career", locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: localizedUrl("/career", locale),
      type: "website",
    },
  };
}

export default function CareerPage() {
  return <CareerContent />;
}
