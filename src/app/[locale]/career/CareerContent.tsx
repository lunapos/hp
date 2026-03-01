"use client";

import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  BarChart3,
  FileCheck,
  TrendingUp,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { useTranslations } from "next-intl";

const featureIcons = [BarChart3, FileCheck, TrendingUp, Layers];

export default function CareerContent() {
  const t = useTranslations('career');
  const tCommon = useTranslations('common');

  const features = ([0, 1, 2, 3] as const).map((i) => ({
    icon: featureIcons[i],
    title: t(`features.${i}.title`),
    desc: t(`features.${i}.description`),
  }));

  const comparisonRows = ([0, 1, 2, 3, 4] as const).map((i) => ({
    label: t(`comparison.${i}.label`),
    existing: t(`comparison.${i}.existing`),
    luna: t(`comparison.${i}.luna`),
  }));

  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
            {t('subtitle')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
            {t('title')}
          </h1>
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto leading-relaxed">
            {t('intro1')}
            <br className="hidden md:block" />
            {t('intro2')}
          </p>
          <span className="inline-block mt-3 text-xs bg-luna-gold/20 text-luna-gold px-3 py-1 rounded-full font-medium">
            {t('badge')}
          </span>
        </div>
      </section>

      {/* Why Luna Pos */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-luna-text-primary text-center mb-4">
            {t('whyTitle')}
          </h2>
          <p className="text-luna-text-secondary leading-relaxed text-center">
            {t('whyDescription')}
          </p>
        </div>
      </Section>

      {/* Features */}
      <Section className="bg-luna-surface/50">
        <h2 className="text-2xl font-bold text-luna-text-primary text-center mb-8">
          {t('whatTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={i} hover>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-luna-gold/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-luna-gold" />
                  </div>
                  <div>
                    <h3 className="text-luna-text-primary font-bold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-luna-text-secondary text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Comparison Table */}
      <Section>
        <h2 className="text-2xl font-bold text-luna-text-primary text-center mb-8">
          {t('comparisonTitle')}
        </h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luna-border">
                <th className="text-left text-luna-text-secondary font-medium py-3 px-4" />
                <th className="text-left text-luna-text-secondary font-medium py-3 px-4">
                  {t('comparisonHeaders.existing')}
                </th>
                <th className="text-left text-luna-gold font-bold py-3 px-4">
                  {t('comparisonHeaders.luna')}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-luna-border/50"
                >
                  <td className="py-3 px-4 text-luna-text-primary font-medium whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="py-3 px-4 text-luna-text-secondary">
                    {row.existing}
                  </td>
                  <td className="py-3 px-4 text-luna-text-primary">
                    {row.luna}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Roadmap note */}
      <Section className="bg-luna-surface/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-luna-text-primary mb-4">
            {t('stepsTitle')}
          </h2>
          <p className="text-luna-text-secondary leading-relaxed mb-8">
            {t('stepsDescription')}
          </p>
          <p className="text-luna-text-primary font-medium italic">
            {t('stepsNote')}
          </p>
        </div>

        <div className="text-center mt-10">
          <Button href="/" variant="secondary">
            <ArrowLeft className="w-4 h-4" />
            {tCommon('backToTop')}
          </Button>
        </div>
      </Section>
    </>
  );
}
