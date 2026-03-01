import { getTranslations } from 'next-intl/server';
import FundContent from "./FundContent";

export async function generateMetadata() {
  const t = await getTranslations('metadata.fund');
  return { title: t('title'), description: t('description') };
}

export default function FundPage() {
  return <FundContent />;
}
