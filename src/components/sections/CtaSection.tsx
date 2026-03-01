"use client";

import { useTranslations } from "next-intl";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";

export default function CtaSection() {
  const t = useTranslations("cta");

  return (
    <Section>
      <div className="relative bg-luna-surface border border-luna-border rounded-2xl p-12 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(var(--luna-accent-rgb),0.08)_0%,_transparent_70%)]" />

        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold text-luna-text-primary mb-4">
            {t("title")}
          </h2>
          <p className="text-luna-text-secondary mb-8 max-w-lg mx-auto">
            {t("description1")}
            <br />
            {t("description2")}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button href="/contact" size="lg">
              {t("button")}
            </Button>
            <a
              href="/contact"
              className="text-luna-text-secondary text-sm hover:text-luna-text-primary transition-colors"
            >
              {t("emailLink")}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
