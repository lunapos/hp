"use client";

import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { Building2, ArrowRight, TrendingUp, Users, Globe } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const appealIcons = [TrendingUp, Users, Globe];

export default function InvestorSection() {
  const t = useTranslations('investor');

  const appeals = ([0, 1, 2] as const).map((i) => ({
    icon: appealIcons[i],
    title: t(`cards.${i}.title`),
    desc: t(`cards.${i}.description`),
  }));

  return (
    <Section>
      <SectionHeading
        subtitle={t('subtitle')}
        title={t('title')}
        description={t('description')}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {appeals.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} hover>
              <div className="w-10 h-10 rounded-lg bg-luna-gold/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-luna-gold" />
              </div>
              <h3 className="text-luna-text-primary font-bold mb-2">{item.title}</h3>
              <p className="text-luna-text-secondary text-sm leading-relaxed">
                {item.desc}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-luna-gold/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-luna-gold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-luna-text-primary">
                {t('ctaTitle')}
              </h3>
              <p className="text-luna-text-secondary text-xs">
                {t('ctaSubtitle')}
              </p>
            </div>
          </div>
          <p className="text-luna-text-secondary text-sm leading-relaxed mb-6">
            {t('ctaDescription')}
          </p>
          <Link
            href="/contact?type=投資・出資について"
            className="inline-flex items-center gap-2 bg-luna-gold text-luna-bg px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-luna-gold-light transition-colors"
          >
            {t('ctaButton')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>
    </Section>
  );
}
