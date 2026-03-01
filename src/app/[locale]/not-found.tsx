"use client";

import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations('notFound');
  const tCommon = useTranslations('common');

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-4">
          PAGE NOT FOUND
        </p>
        <h1 className="text-8xl md:text-9xl font-black text-luna-text-primary mb-2">
          404
        </h1>
        <p className="text-luna-text-secondary text-lg mb-8">
          {t('message')}
        </p>
        <Button href="/">{tCommon('backToTop')}</Button>
      </div>
    </section>
  );
}
