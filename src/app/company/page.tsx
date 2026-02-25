import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import { COMPANY_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "運営について",
  description: "LunaPosの運営情報。ナイト業界向けPOSシステムの開発・提供。",
};

export default function CompanyPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
            COMPANY
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
            運営について
          </h1>
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full" />
        </div>
      </section>

      {/* Company Info Table */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="divide-y divide-luna-border">
              {COMPANY_INFO.map((info, index) => (
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
                  FOUNDER
                </p>
                <h3 className="text-xl font-bold text-luna-text-primary mb-4">代表</h3>
                <p className="text-luna-text-secondary text-sm leading-relaxed">
                  外資系IT・通信・AI領域でエンジニアとしてキャリアを積む。日本やシンガポールを含む東南アジアでナイトエンタメ業界にも携わり、現場で感じた既存POSへの不満から、LunaPosを開発。
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
              MISSION
            </p>
            <p className="text-2xl md:text-3xl font-bold text-luna-text-primary leading-relaxed">
              テクノロジーで、
              <br />
              ナイトビジネスをスマートに。
            </p>
            <p className="text-luna-text-secondary mt-4 leading-relaxed">
              ナイトエンタメ業界に本当に必要なものを、現場を知るエンジニアが作る。オーナーの業務効率化から、キャスト・スタッフの働きやすさ、お客様の体験まで、テクノロジーで変えていきます。
            </p>
          </Card>
        </div>
      </Section>

    </>
  );
}
