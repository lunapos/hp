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

const targetRegions = [
  {
    region: "シンガポール",
    desc: "アジア有数のナイトライフ市場。高い規制基準に対応し、プレミアム市場から展開開始。",
    status: "最初のターゲット",
  },
  {
    region: "東南アジア",
    desc: "タイ・フィリピン・ベトナムなど、急成長するナイトエンターテインメント市場へ展開。",
    status: "第2フェーズ",
  },
  {
    region: "東アジア",
    desc: "韓国・台湾・香港など、日本と類似した接客文化を持つ市場への展開。",
    status: "第3フェーズ",
  },
  {
    region: "欧米",
    desc: "ナイトクラブ・ラウンジ文化が根付く欧米市場へ。チップ制度など独自の料金体系に対応。",
    status: "将来構想",
  },
];

const challenges = [
  {
    icon: Languages,
    title: "多言語対応",
    desc: "英語・中国語・韓国語・タイ語など、各地域の言語に対応したUIを提供。スタッフもお客様もストレスなく利用可能。",
  },
  {
    icon: Banknote,
    title: "各国通貨・決済対応",
    desc: "現地通貨での価格表示・決済、各国の主要決済サービスとの連携。為替レートの自動反映。",
  },
  {
    icon: Scale,
    title: "法規制への対応",
    desc: "各国のナイトエンターテインメント業界に関する法規制・税制に準拠。コンプライアンスを確保した運営を支援。",
  },
  {
    icon: MapPin,
    title: "ローカライズ",
    desc: "料金体系・チップ制度・営業時間制限など、地域ごとの商習慣に柔軟に対応できる設計。",
  },
];

export default function WorldContent() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-emerald-400 text-sm tracking-[0.3em] font-medium mb-2">
            LUNA WORLD
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
            海外展開プログラム
          </h1>
          <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            日本のナイト業界で培ったPOSシステムを、世界のナイトクラブ・ラウンジ・バーへ。
            ナイトエンターテインメント業界のグローバルスタンダードを目指します。
          </p>
          <span className="inline-block mt-3 text-xs bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full font-medium">
            ビジョン
          </span>
        </div>
      </section>

      {/* Vision */}
      <Section>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-luna-text-primary mb-4">
            世界標準のナイトクラブPOSへ
          </h2>
          <p className="text-luna-text-secondary leading-relaxed">
            日本のホスト・キャバクラ業界で磨かれたLunaPosの「複雑な料金体系への対応力」と「オフライン動作の安定性」は、
            世界のナイトエンターテインメント業界が求める機能そのものです。
            各国の文化・規制に柔軟に対応しながら、グローバルに展開していきます。
          </p>
        </div>
      </Section>

      {/* Target Regions */}
      <Section className="bg-luna-surface/50">
        <h2 className="text-2xl font-bold text-luna-text-primary text-center mb-8">
          展開ロードマップ
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
          グローバル対応の取り組み
        </h2>
        <p className="text-luna-text-secondary text-center mb-8 max-w-2xl mx-auto">
          世界展開に向けて、各地域の特性に対応する機能を開発していきます。
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
            トップページに戻る
          </Button>
        </div>
      </Section>
    </>
  );
}
