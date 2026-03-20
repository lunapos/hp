import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Suspense } from "react";
import ContactContent from "./ContactContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.contact');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/contact",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/contact",
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
