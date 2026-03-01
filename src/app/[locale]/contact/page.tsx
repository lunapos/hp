import { getTranslations } from 'next-intl/server';
import { Suspense } from "react";
import ContactContent from "./ContactContent";

export async function generateMetadata() {
  const t = await getTranslations('metadata.contact');
  return { title: t('title'), description: t('description') };
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactContent />
    </Suspense>
  );
}
