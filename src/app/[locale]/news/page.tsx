import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import NewsTabs from "@/components/ui/NewsTabs";
import { getLocalizedNewsItems } from "@/data/news";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata.news');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/news",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/news",
      type: "website",
    },
    ...(locale !== "ja" && { robots: { index: false, follow: true } }),
  };
}

export default async function NewsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab } = await searchParams;
  const defaultTab =
    tab === "announcements" ? "announcements" : "updates";

  const t = await getTranslations('news');
  const items = await getLocalizedNewsItems(locale);

  return (
    <Section className="pt-32">
      <SectionHeading
        subtitle={t('subtitle')}
        title={t('title')}
      />
      <NewsTabs items={items} defaultTab={defaultTab} />
    </Section>
  );
}
