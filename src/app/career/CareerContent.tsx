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

const features = [
  {
    icon: BarChart3,
    title: "実績ベースの店舗評価",
    desc: "POSに蓄積された売上データから、店舗の実力を客観的に表示。「平均客単価」「キャスト一人あたりの平均売上」「指名率」など、数字に基づいた店舗プロフィールを求職者に提示。求人広告の「稼げる」に、初めてデータの裏付けがつきます。",
  },
  {
    icon: FileCheck,
    title: "キャストの実績ポートフォリオ",
    desc: "指名実績・売上貢献度を匿名化した形でポートフォリオとして保持。移籍・体入時の条件交渉が「実績ベース」で行えるようになり、店舗・キャスト双方にとって公平な採用を実現します。",
  },
  {
    icon: TrendingUp,
    title: "需要予測に基づく採用提案",
    desc: "POSの売上トレンドとシフト充足率から、「このままだと来月人手が足りなくなる」という予測が可能に。店舗が人手不足を実感する前に採用を提案。求人の「事後対応」から「先回り」への転換です。",
  },
  {
    icon: Layers,
    title: "シフト〜給与まで一気通貫",
    desc: "LunaPosには既にシフト管理・会計管理・給与計算の機能があります。求人で採用が決まれば、そのままシフト登録→勤怠管理→給与計算まで、一つのプラットフォーム内で完結。店舗の管理コストを大幅に削減します。",
  },
];

const comparisonRows = [
  {
    label: "店舗情報の信頼性",
    existing: "自己申告",
    luna: "POSデータに基づく客観指標",
  },
  {
    label: "収入情報",
    existing: "「月収○万円可能」等の曖昧表現",
    luna: "平均売上・指名率等の実データ",
  },
  {
    label: "採用後の管理",
    existing: "求人掲載で完結",
    luna: "シフト・勤怠・給与まで一貫",
  },
  {
    label: "採用タイミング",
    existing: "店舗が必要と感じてから",
    luna: "データに基づく先回り提案",
  },
  {
    label: "キャストの評価",
    existing: "面接時の自己申告",
    luna: "匿名化された実績データ",
  },
];

export default function CareerContent() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
            LUNA CAREER
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            求人プラットフォーム構想
          </h1>
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto leading-relaxed">
            POSデータが変える、ナイトワーク求人のあり方。
            <br className="hidden md:block" />
            「裏付けのある求人」で、業界の信頼性を根本から変えます。
          </p>
          <span className="inline-block mt-3 text-xs bg-luna-gold/20 text-luna-gold px-3 py-1 rounded-full font-medium">
            開発予定
          </span>
        </div>
      </section>

      {/* Why Luna Pos */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            なぜ LunaPos が求人をやるのか
          </h2>
          <p className="text-luna-text-secondary leading-relaxed text-center mb-4">
            従来の求人は、店舗が自己申告で条件を掲載し、求職者はその情報を信じるしかありませんでした。
            「月収○万円可能」「未経験歓迎」——実態との乖離が、業界全体の信頼性を下げています。
          </p>
          <p className="text-luna-text-secondary leading-relaxed text-center">
            LunaPosは店舗の指名本数、売上実績、客単価、シフト稼働率といった
            営業データをリアルタイムで保持しています。
            このデータを求人領域に活用することで、既存の求人媒体には不可能だった
            <span className="text-white font-medium">「裏付けのある求人」</span>
            が実現します。
          </p>
        </div>
      </Section>

      {/* Features */}
      <Section className="bg-luna-surface/50">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          具体的にできること
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
                    <h3 className="text-white font-bold mb-2">
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
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          既存求人媒体との違い
        </h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luna-border">
                <th className="text-left text-luna-text-secondary font-medium py-3 px-4" />
                <th className="text-left text-luna-text-secondary font-medium py-3 px-4">
                  既存求人サイト
                </th>
                <th className="text-left text-luna-gold font-bold py-3 px-4">
                  Luna Career
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-luna-border/50"
                >
                  <td className="py-3 px-4 text-white font-medium whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="py-3 px-4 text-luna-text-secondary">
                    {row.existing}
                  </td>
                  <td className="py-3 px-4 text-white">
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
          <h2 className="text-2xl font-bold text-white mb-4">
            展開のステップ
          </h2>
          <p className="text-luna-text-secondary leading-relaxed mb-8">
            この構想は、LunaPosの導入店舗数が一定規模に達した段階で実現します。
            まずはPOS単体の価値で導入店舗を拡大し、蓄積されたデータとネットワークを土台にして、
            段階的に求人領域へ展開していきます。
          </p>
          <p className="text-white font-medium italic">
            LunaPosは、店舗経営の効率化から始まり、業界の人材流動を最適化するインフラへと進化する。
          </p>
        </div>

        <div className="text-center mt-10">
          <Button href="/" variant="secondary">
            <ArrowLeft className="w-4 h-4" />
            トップページに戻る
          </Button>
        </div>
      </Section>
    </>
  );
}
