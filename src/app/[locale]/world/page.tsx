import { getTranslations } from 'next-intl/server';
import WorldContent from "./WorldContent";

export async function generateMetadata() {
  const t = await getTranslations('metadata.world');
  return { title: t('title'), description: t('description') };
}

export default function WorldPage() {
  return <WorldContent />;
}
