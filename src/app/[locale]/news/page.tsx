import { getTranslations } from 'next-intl/server';
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import NewsTabs from "@/components/ui/NewsTabs";
import { newsItems } from "@/data/news";

export async function generateMetadata() {
  const t = await getTranslations('metadata.news');
  return { title: t('title'), description: t('description') };
}

export default async function NewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const defaultTab =
    tab === "announcements" ? "announcements" : "updates";

  const t = await getTranslations('news');

  return (
    <Section className="pt-32">
      <SectionHeading
        subtitle={t('subtitle')}
        title={t('title')}
      />
      <NewsTabs items={newsItems} defaultTab={defaultTab} />
    </Section>
  );
}
