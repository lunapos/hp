import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "LunaPosのプライバシーポリシーです。",
};

const sections = [
  {
    title: "1. 個人情報の定義",
    body: "本ポリシーにおける「個人情報」とは、個人情報保護法に定める個人情報を指し、氏名、メールアドレス、電話番号など、特定の個人を識別できる情報をいいます。",
  },
  {
    title: "2. 個人情報の収集方法",
    body: "当方は、以下の場合に個人情報を取得することがあります。\n・サービスの利用登録時\n・お問い合わせフォームからのご連絡時\n・各種お申し込み時\n・Cookieやアクセスログ等による自動取得",
  },
  {
    title: "3. 個人情報の利用目的",
    body: "取得した個人情報は、以下の目的で利用します。\n・サービスの提供・運営・改善\n・お問い合わせへの対応\n・利用規約に違反する行為への対応\n・サービスに関するお知らせの送付\n・新機能・更新情報のご案内\n・統計データの作成（個人を識別できない形式）",
  },
  {
    title: "4. 個人情報の第三者提供",
    body: "当方は、以下の場合を除き、利用者の同意なく第三者に個人情報を提供しません。\n・法令に基づく場合\n・人の生命・身体・財産の保護のため必要な場合\n・公衆衛生の向上または児童の健全な育成の推進のため必要な場合\n・国の機関または地方公共団体への協力が必要な場合",
  },
  {
    title: "5. 個人情報の管理",
    body: "当方は、個人情報の漏洩・滅失・毀損の防止のため、適切なセキュリティ対策を講じます。個人情報の取り扱いを外部に委託する場合は、委託先に対して適切な管理を求めます。",
  },
  {
    title: "6. 個人情報の開示・訂正・削除",
    body: "利用者は、当方に対して個人情報の開示・訂正・削除を請求することができます。請求があった場合、本人確認の上、合理的な期間内に対応します。ご請求はお問い合わせフォームよりご連絡ください。",
  },
  {
    title: "7. Cookieの利用",
    body: "当サービスでは、利用者の利便性向上やアクセス解析のためにCookieを使用する場合があります。利用者はブラウザの設定によりCookieを無効にすることができますが、一部の機能が制限される場合があります。",
  },
  {
    title: "8. アクセス解析ツール",
    body: "当サービスでは、アクセス解析のためにGoogle Analyticsを使用する場合があります。Google Analyticsはデータ収集のためにCookieを使用しますが、このデータは匿名で収集されており、個人を特定するものではありません。",
  },
  {
    title: "9. ポリシーの変更",
    body: "当方は、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、当サービス上に掲載した時点で効力を生じます。",
  },
  {
    title: "10. お問い合わせ",
    body: "本ポリシーに関するお問い合わせは、当サービスのお問い合わせフォームよりご連絡ください。\n\nLunaPos\nメール: info@lunapos.jp",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
            PRIVACY POLICY
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            プライバシーポリシー
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
                  <h2 className="text-white font-bold mb-3">{section.title}</h2>
                  <p className="text-luna-text-secondary text-sm leading-relaxed whitespace-pre-line">
                    {section.body}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-luna-border">
                <p className="text-luna-text-secondary text-xs">
                  制定日: 2026年2月23日
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
