"use client";

import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { Building2, ArrowRight, TrendingUp, Users, Globe } from "lucide-react";
import Link from "next/link";

const appeals = [
  {
    icon: TrendingUp,
    title: "成長市場",
    desc: "ナイト業界のDXはまだ黎明期。先行者として市場を開拓する大きなチャンスがあります。",
  },
  {
    icon: Users,
    title: "導入実績",
    desc: "実際の店舗での導入・運用実績をもとに、プロダクトの改善と拡大を進めています。",
  },
  {
    icon: Globe,
    title: "拡張性のあるビジョン",
    desc: "POS → Luna Career → Luna Fund → Luna World と、段階的に事業領域を拡大する明確なロードマップ。",
  },
];

export default function InvestorSection() {
  return (
    <Section>
      <SectionHeading
        subtitle="INVESTOR"
        title="投資・出資をご検討の方へ"
        description="ナイト業界のDXを一緒に推進するパートナーを募集しています。"
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
                LunaPos への出資をご検討の方
              </h3>
              <p className="text-luna-text-secondary text-xs">
                事業計画・収支見通しなどの資料をお送りします
              </p>
            </div>
          </div>
          <p className="text-luna-text-secondary text-sm leading-relaxed mb-6">
            LunaPosはナイトエンターテインメント業界に特化したPOSシステムとして、業界のインフラとなることを目指しています。
            事業への出資にご興味のある方は、お気軽にお問い合わせください。
          </p>
          <Link
            href="/contact?type=投資・出資について"
            className="inline-flex items-center gap-2 bg-luna-gold text-luna-bg px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-luna-gold-light transition-colors"
          >
            お問い合わせ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>
    </Section>
  );
}
