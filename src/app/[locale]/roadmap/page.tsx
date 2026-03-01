import { getTranslations } from 'next-intl/server';
import RoadmapSection from "@/components/sections/RoadmapSection";

export async function generateMetadata() {
  const t = await getTranslations('metadata.roadmap');
  return { title: t('title'), description: t('description') };
}

export default function RoadmapPage() {
  return <RoadmapSection />;
}
