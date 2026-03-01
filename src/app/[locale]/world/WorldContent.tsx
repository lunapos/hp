"use client";

import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Globe,
  MapPin,
  Languages,
  Scale,
  Banknote,
  ArrowLeft,
} from "lucide-react";
import { useTranslations } from "next-intl";

const challengeIcons = [Languages, Banknote, Scale, MapPin];

export default function WorldContent() {
  const t = useTranslations('world');
  const tCommon = useTranslations('common');

  const targetRegions = ([0, 1, 2, 3] as const).map((i) => ({
    region: t(`regions.${i}.name`),
    desc: t(`regions.${i}.description`),
    status: t(`regions.${i}.status`),
  }));

  const challenges = ([0, 1, 2, 3] as const).map((i) => ({
    icon: challengeIcons[i],
    title: t(`challenges.${i}.title`),
    desc: t(`challenges.${i}.description`),
  }));

  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-emerald-400 text-sm tracking-[0.3em] font-medium mb-2">
            {t('subtitle')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
            {t('title')}
          </h1>
          <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            {t('description')}
          </p>
          <span className="inline-block mt-3 text-xs bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full font-medium">
            {t('badge')}
          </span>
        </div>
      </section>

      {/* Vision */}
      <Section>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-luna-text-primary mb-4">
            {t('visionTitle')}
          </h2>
          <p className="text-luna-text-secondary leading-relaxed">
            {t('visionDescription')}
          </p>
        </div>
      </Section>

      {/* Target Regions */}
      <Section className="bg-luna-surface/50">
        <h2 className="text-2xl font-bold text-luna-text-primary text-center mb-8">
          {t('roadmapTitle')}
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {targetRegions.map((region, i) => (
            <Card key={i} hover>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 font-bold text-sm">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-luna-text-primary font-bold">{region.region}</h3>
                    <span className="text-xs bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      {region.status}
                    </span>
                  </div>
                  <p className="text-luna-text-secondary text-sm leading-relaxed">
                    {region.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Challenges */}
      <Section>
        <h2 className="text-2xl font-bold text-luna-text-primary text-center mb-3">
          {t('challengesTitle')}
        </h2>
        <p className="text-luna-text-secondary text-center mb-8 max-w-2xl mx-auto">
          {t('challengesDescription')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {challenges.map((challenge, i) => {
            const Icon = challenge.icon;
            return (
              <Card key={i} hover>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-luna-text-primary font-bold mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-luna-text-secondary text-sm leading-relaxed">
                      {challenge.desc}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button href="/" variant="secondary">
            <ArrowLeft className="w-4 h-4" />
            {tCommon('backToTop')}
          </Button>
        </div>
      </Section>
    </>
  );
}
