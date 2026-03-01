import { getTranslations } from 'next-intl/server';
import FeaturesContent from "./FeaturesContent";

export async function generateMetadata() {
  const t = await getTranslations('metadata.features');
  return { title: t('title'), description: t('description') };
}

export default function FeaturesPage() {
  return <FeaturesContent />;
}
