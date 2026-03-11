"use client";

import { useTranslations } from "next-intl";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRICING_PLAN, ALL_FEATURE_ICONS } from "@/lib/constants";
import { Check, Sparkles, Gift } from "lucide-react";

export default function PricingSection() {
  const t = useTranslations("pricing");
  const tAll = useTranslations("allFeatures");

  return (
    <Section className="bg-luna-surface/50">
      <SectionHeading
        subtitle={t("subtitle")}
        title={t("title")}
        description={t("description")}
      />

      <div className="max-w-lg mx-auto">
        <div className="bg-luna-surface border-2 border-luna-gold rounded-2xl p-8 shadow-[0_0_30px_rgba(var(--luna-accent-rgb),0.15)]">
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-black text-luna-text-primary">
                {PRICING_PLAN.price}
              </span>
              <span className="text-luna-text-secondary text-lg">/{t("perMonth")}</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            {Array.from({ length: PRICING_PLAN.featureCount }, (_, i) => i).map((i) => (
              <li key={i} className="flex items-center gap-3 text-luna-text-primary">
                <Check className="w-5 h-5 text-luna-gold shrink-0" />
                {tAll(`${i}.title`)}
              </li>
            ))}
          </ul>

          {/* Free Note */}
          <div className="bg-luna-bg rounded-xl p-4 border border-luna-border mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-luna-gold" />
              <span className="text-luna-gold text-sm font-medium">
                {t("freeNote")}
              </span>
            </div>
          </div>

          {/* AI Note */}
          <div className="bg-luna-bg rounded-xl p-4 border border-luna-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-luna-gold" />
              <span className="text-luna-gold text-sm font-medium">
                {t("aiTitle")}
              </span>
            </div>
            <p className="text-luna-text-secondary text-sm leading-relaxed">
              {t("aiNote")}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
