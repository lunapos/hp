import { getTranslations } from 'next-intl/server';
import CareerContent from "./CareerContent";

export async function generateMetadata() {
  const t = await getTranslations('metadata.career');
  return { title: t('title'), description: t('description') };
}

export default function CareerPage() {
  return <CareerContent />;
}
