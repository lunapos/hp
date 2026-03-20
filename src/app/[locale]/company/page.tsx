import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.company');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/company",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/company",
      type: "website",
    },
  };
}

export default async function CompanyPage() {
  const t = await getTranslations('company');

  const infoLabels = t.raw('infoLabels') as Record<string, string>;
  const infoValues = t.raw('infoValues') as Record<string, string>;
  const companyInfo = Object.keys(infoLabels).map((key) => ({
    label: infoLabels[key],
    value: infoValues[key],
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
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full" />
        </div>
      </section>

      {/* Company Info Table */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="divide-y divide-luna-border">
              {companyInfo.map((info, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row py-4 first:pt-0 last:pb-0"
                >
                  <dt className="sm:w-1/3 text-luna-text-secondary text-sm font-medium mb-1 sm:mb-0">
                    {info.label}
                  </dt>
                  <dd className="sm:w-2/3 text-luna-text-primary text-sm">
                    {info.value}
                  </dd>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* Founder */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <Card className="border-luna-gold/30">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Avatar placeholder */}
              <div className="w-28 h-28 rounded-full bg-luna-bg border-2 border-luna-gold/30 flex items-center justify-center shrink-0">
                <span className="text-4xl text-luna-gold">&#9789;</span>
              </div>

              <div>
                <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
                  {t('founderSubtitle')}
                </p>
                <h3 className="text-xl font-bold text-luna-text-primary mb-4">{t('founderTitle')}</h3>
                <p className="text-luna-text-secondary text-sm leading-relaxed">
                  {t('founderBio')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Mission */}
      <Section className="bg-luna-surface/50">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="border-luna-gold/30">
            <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-4">
              {t('missionSubtitle')}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-luna-text-primary leading-relaxed">
              {t('missionTitle')}
            </p>
            <p className="text-luna-text-secondary mt-4 leading-relaxed">
              {t('missionDescription')}
            </p>
          </Card>
        </div>
      </Section>

    </>
  );
}
