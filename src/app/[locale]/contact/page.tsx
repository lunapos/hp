import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { localizedAlternates, localizedUrl } from "@/lib/seo";
import { Suspense } from "react";
import ContactContent from "./ContactContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata.contact');
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates("/contact", locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: localizedUrl("/contact", locale),
      type: "website",
    },
  };
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactContent />
    </Suspense>
  );
}
