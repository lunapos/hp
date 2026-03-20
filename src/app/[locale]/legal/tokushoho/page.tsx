import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.tokushoho');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "https://lunapos.jp/legal/tokushoho",
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://lunapos.jp/legal/tokushoho",
      type: "website",
    },
  };
}

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
      "サービスの性質上、提供開始後の返品・返金は原則としてお受けしておりません。なお、累計500会計までは無料でご利用いただけます。Proプラン（月額¥30,000）への移行後も、解約はいつでも可能です。",
  },
  {
    label: "解約",
    value:
      "解約はいつでも可能です。最低利用期間の定めはありません。アプリ内の設定画面から解約手続きを行えます。",
  },
  {
    label: "動作環境",
    value: "Floor: iPad（iPadOS 17以降）\nAdmin / Cast: Webブラウザ（Chrome、Safari、Firefox 最新版）",
  },
];

export default async function TokushohoPage() {
  const t = await getTranslations('legal.tokushoho');

  return (
    <>
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
                  <dd className="sm:w-2/3 text-luna-text-primary text-sm">{item.value}</dd>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
