import { getTranslations } from 'next-intl/server';
import InvestorSection from "@/components/sections/InvestorSection";

export async function generateMetadata() {
  const t = await getTranslations('metadata.investor');
  return { title: t('title'), description: t('description') };
}

export default function InvestorPage() {
  return <InvestorSection />;
}
