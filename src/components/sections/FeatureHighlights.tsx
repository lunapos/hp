"use client";

import { useTranslations } from "next-intl";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FEATURE_HIGHLIGHT_ICONS } from "@/lib/constants";
import { Check } from "lucide-react";

export default function FeatureHighlights() {
  const t = useTranslations("featureHighlights");

  return (
    <Section>
      <SectionHeading
        subtitle={t("subtitle")}
        title={t("title")}
        description={t("description")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {FEATURE_HIGHLIGHT_ICONS.map((Icon, index) => (
          <Card key={index} hover className={`animation-delay-${(index + 1) * 100}`}>
            <div className="w-12 h-12 rounded-xl bg-luna-gold/10 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-luna-gold" />
            </div>
            <h3 className="text-lg font-bold text-luna-text-primary mb-2">
              {t(`items.${index}.title`)}
            </h3>
            <p className="text-luna-text-secondary text-sm leading-relaxed mb-4">
              {t(`items.${index}.description`)}
            </p>
            <ul className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => i).map((i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-luna-text-secondary"
                >
                  <Check className="w-4 h-4 text-luna-gold shrink-0" />
                  {t(`items.${index}.details.${i}`)}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button href="/features" variant="secondary">
          {t("viewAll")}
        </Button>
      </div>
    </Section>
  );
}
