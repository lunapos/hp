"use client";

import { useTranslations } from "next-intl";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import { FAQ_COUNT } from "@/lib/constants";

export default function FaqSection() {
  const t = useTranslations("faq");

  const items = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <Section className="bg-luna-surface/50">
      <SectionHeading subtitle={t("subtitle")} title={t("title")} />
      <div className="max-w-3xl mx-auto">
        <Accordion items={items} />
      </div>
    </Section>
  );
}
