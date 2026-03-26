import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { localizedAlternates, localizedUrl } from "@/lib/seo";
import RoadmapSection from "@/components/sections/RoadmapSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata.roadmap');
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates("/roadmap", locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: localizedUrl("/roadmap", locale),
      type: "website",
    },
  };
}

export default function RoadmapPage() {
  return <RoadmapSection />;
}
