import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import RoadmapSection from "@/components/sections/RoadmapSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.roadmap');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/roadmap",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/roadmap",
      type: "website",
    },
  };
}

export default function RoadmapPage() {
  return <RoadmapSection />;
}
