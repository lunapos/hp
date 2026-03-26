import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { localizedAlternates, localizedUrl } from "@/lib/seo";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata.terms');
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates("/legal/terms", locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: localizedUrl("/legal/terms", locale),
      type: "website",
    },
  };
}

const sections = [
  {
    title: "第1条（適用）",
    body: "本規約は、LunaPos（以下「当サービス」）の利用に関する条件を定めるものです。利用者は本規約に同意の上、当サービスをご利用ください。",
  },
  {
    title: "第2条（定義）",
    body: "「利用者」とは、当サービスの利用を申し込み、当方が承認した個人または法人をいいます。「コンテンツ」とは、当サービスを通じて提供される情報、データ、ソフトウェア等をいいます。",
  },
  {
    title: "第3条（利用登録）",
    body: "利用希望者は、当方の定める方法により利用登録を申請し、当方がこれを承認することで利用登録が完了します。当方は、以下の場合に利用登録を拒否することがあります。\n・申請内容に虚偽があった場合\n・過去に規約違反等で利用停止となったことがある場合\n・その他、当方が不適当と判断した場合",
  },
  {
    title: "第4条（利用料金）",
    body: "利用者は、当方が定める利用料金を、当方が指定する方法により支払うものとします。利用料金の支払いを遅滞した場合、年14.6%の割合による遅延損害金を支払うものとします。",
  },
  {
    title: "第5条（禁止事項）",
    body: "利用者は以下の行為を行ってはなりません。\n・法令または公序良俗に違反する行為\n・当サービスの運営を妨害する行為\n・他の利用者の情報を不正に収集する行為\n・当サービスの不正アクセスまたはこれを試みる行為\n・当方または第三者の知的財産権を侵害する行為\n・その他、当方が不適切と判断する行為",
  },
  {
    title: "第6条（サービスの停止・変更）",
    body: "当方は、以下の場合に事前通知なくサービスの全部または一部を停止・変更できるものとします。\n・システムの保守・更新を行う場合\n・天災等の不可抗力により提供が困難な場合\n・その他、当方がやむを得ないと判断した場合",
  },
  {
    title: "第7条（知的財産権）",
    body: "当サービスに関する知的財産権は、すべて当方または正当な権利者に帰属します。利用者は、当方の事前の書面による承諾なく、これらを複製・転用・販売等することはできません。",
  },
  {
    title: "第8条（免責事項）",
    body: "当方は、当サービスに関して利用者に生じた損害について、当方の故意または重過失による場合を除き、一切の責任を負いません。当方が責任を負う場合でも、その範囲は利用者が支払った利用料金の直近1ヶ月分を上限とします。",
  },
  {
    title: "第9条（個人情報の取り扱い）",
    body: "当方は、利用者の個人情報を当方のプライバシーポリシーに従い適切に取り扱います。",
  },
  {
    title: "第10条（データの利用）",
    body: "当方は、利用者が当サービスを通じて蓄積した売上データ・来店データ・スタッフデータ等を、統計処理・匿名化した上で、以下の目的に利用することがあります。\n・当サービスの品質改善・新機能開発\n・Luna Pos Fund（投資家マッチング・事業売却仲介機能）における事業評価指標の算出\n・Luna Pos Career（キャリア証明機能）における実績データの活用\n・業界全体の傾向分析・レポートの作成\n利用者の個別データを特定可能な形で第三者に提供する場合は、別途利用者の同意を得るものとします。",
  },
  {
    title: "第11条（解約）",
    body: "利用者は、アプリ内の設定画面からいつでも解約手続きを行うことができます。最低利用期間の定めはありません。解約後も、利用期間終了日まではサービスをご利用いただけます。解約に伴う返金は原則として行いません。",
  },
  {
    title: "第12条（規約の変更）",
    body: "当方は、必要に応じて本規約を変更できるものとします。変更後の規約は、当サービス上に掲載した時点で効力を生じます。",
  },
  {
    title: "第13条（準拠法・管轄）",
    body: "本規約の解釈は日本法に準拠します。当サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。",
  },
];

export default async function TermsPage() {
  const t = await getTranslations('legal.terms');

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
            <div className="space-y-8">
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-luna-text-primary font-bold mb-3">{section.title}</h2>
                  <p className="text-luna-text-secondary text-sm leading-relaxed whitespace-pre-line">
                    {section.body}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-luna-border">
                <p className="text-luna-text-secondary text-xs">
                  {t('effectiveDate')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
