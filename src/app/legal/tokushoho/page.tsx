import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "LunaPosの特定商取引法に基づく表記です。",
};

const items = [
  { label: "販売事業者", value: "LunaPos" },
  { label: "所在地", value: "東京都世田谷区（詳細はお問い合わせください）" },
  { label: "メールアドレス", value: "info@lunapos.jp" },
  {
    label: "電話番号",
    value: "お問い合わせフォームよりご連絡ください",
  },
  { label: "販売URL", value: "https://lunapos.jp" },
  {
    label: "販売価格",
    value: "各サービスページに記載の価格に準じます（税込表示）",
  },
  {
    label: "追加手数料",
    value: "インターネット接続に必要な通信料等は利用者のご負担となります",
  },
  {
    label: "支払方法",
    value: "クレジットカード決済",
  },
  {
    label: "支払時期",
    value: "サービス利用開始時、以降は毎月の契約更新日に自動決済",
  },
  {
    label: "サービス提供時期",
    value: "お申し込み手続き完了後、速やかにご利用いただけます",
  },
  {
    label: "返品・キャンセル",
    value:
      "サービスの性質上、提供開始後の返品・返金は原則としてお受けしておりません。ただし、初回1ヶ月間の無料トライアル期間中は、いつでもキャンセル可能です。",
  },
  {
    label: "解約",
    value:
      "解約はいつでも可能です。最低利用期間の定めはありません。解約は公式LINEまたはお問い合わせフォームよりお申し出ください。",
  },
  {
    label: "動作環境",
    value: "iPad（iPadOS 17以降）",
  },
];

export default function TokushohoPage() {
  return (
    <>
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
            LEGAL
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            特定商取引法に基づく表記
          </h1>
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full" />
        </div>
      </section>

      <Section>
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="divide-y divide-luna-border">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row py-4 first:pt-0 last:pb-0"
                >
                  <dt className="sm:w-1/3 text-luna-text-secondary text-sm font-medium mb-1 sm:mb-0">
                    {item.label}
                  </dt>
                  <dd className="sm:w-2/3 text-white text-sm">{item.value}</dd>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
