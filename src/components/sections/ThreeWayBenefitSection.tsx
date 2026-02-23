"use client";

import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import {
  User,
  Store,
  Building2,
  Check,
} from "lucide-react";

const benefits = [
  {
    icon: User,
    label: "キャスト側",
    color: "text-luna-gold",
    bgColor: "bg-luna-gold/10",
    borderColor: "border-luna-gold/30",
    items: [
      {
        title: "実力を数字で証明できる",
        desc: "指名本数、売上貢献額、リピート率など",
      },
      {
        title: "移籍交渉で有利になる",
        desc: "時給・待遇の根拠として提示可能",
      },
      {
        title: "キャリアの蓄積が可視化される",
        desc: "長く頑張るほどポートフォリオが充実",
      },
      {
        title: "LunaPos導入店舗で働くインセンティブ",
        desc: "非導入店では実績が貯まらない",
      },
    ],
  },
  {
    icon: Store,
    label: "送り出し店舗側（現店舗）",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    items: [
      {
        title: "円満退職を促進",
        desc: "ポートフォリオ発行を退職プロセスに組み込める",
      },
      {
        title: "紹介料収入の仕組み化",
        desc: "データ付き紹介 → 紹介成功報酬",
      },
      {
        title: "キャスト定着率の向上",
        desc: "「ここで実績を積めば次に活きる」という動機",
      },
    ],
  },
  {
    icon: Building2,
    label: "受け入れ店舗側（移籍先）",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    items: [
      {
        title: "採用リスクの低減",
        desc: "売上実績を事前に確認してから採用判断",
      },
      {
        title: "適切な待遇設定",
        desc: "データに基づいた時給・バック率の提示が可能",
      },
      {
        title: "体入荒らしの排除",
        desc: "実績のあるキャストを優先的に採用",
      },
    ],
  },
];

export default function ThreeWayBenefitSection() {
  return (
    <Section>
      <SectionHeading
        subtitle="THREE-WAY VALUE"
        title="3方良しの仕組み"
        description="キャスト・送り出し店舗・受け入れ店舗、すべてにメリットがある人材流動エコシステム。"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Card key={index} hover>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-10 h-10 rounded-lg ${benefit.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${benefit.color}`} />
                </div>
                <h3 className={`text-lg font-bold ${benefit.color}`}>
                  {benefit.label}
                </h3>
              </div>

              <ul className="space-y-4">
                {benefit.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <Check
                      className={`w-4 h-4 ${benefit.color} shrink-0 mt-0.5`}
                    />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="text-luna-text-secondary text-xs mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
