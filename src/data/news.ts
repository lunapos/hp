export interface NewsItem {
  slug: string;
  date: string;
  title: string;
  summary: string;
  category: "お知らせ" | "開発アップデート" | "メンテナンス" | "キャンペーン";
  content?: string;
}

export const newsItems: NewsItem[] = [
  {
    slug: "v0-8-0-light-mode",
    date: "2026-02-25",
    title: "v0.8.0 ライトモード & UI刷新",
    summary:
      "ダーク/ライトモード切り替え、お知らせ・開発アップデートセクション、ファビコン刷新、スライド式テーマトグルを追加。",
    category: "開発アップデート",
    content: [
      "HPサイトにライトモードを追加しました。ヘッダーのスライド式トグルでダーク/ライトを切り替えられます。",
      "",
      "主な変更点：",
      "・ダーク/ライトモード切り替え（CSS変数ベース、localStorage永続化）",
      "・スライド式テーマトグルをヘッダーに配置",
      "・お知らせ・開発アップデートの2カラムセクションをトップに追加",
      "・ファビコン・ロゴをゴールドムーン画像に変更",
      "・お客様の声フォームのメール送信をResend経由に修正",
    ].join("\n"),
  },
  {
    slug: "v0-7-0-media",
    date: "2026-02-25",
    title: "v0.7.0 メディア機能",
    summary:
      "メディア記事ページを追加。タグ別分類、ページネーション、サイトマップ自動生成に対応。",
    category: "開発アップデート",
    content: [
      "HPサイトにメディア（記事）セクションを追加しました。",
      "",
      "主な変更点：",
      "・メディア記事の公開・閲覧ページ",
      "・タグ別記事分類（ドロップダウン式）",
      "・6件/ページのページネーション",
      "・sitemap.xmlへのメディア記事の動的追加",
      "・記事3本を公開（POS戦略、データ活用、キャスト価値）",
    ].join("\n"),
  },
  {
    slug: "v0-6-0-form-analytics",
    date: "2026-02-25",
    title: "v0.6.0 フォーム統合 & アナリティクス",
    summary:
      "LP・HP間のお問い合わせフォームを統合。GA4イベント計測、送信元フォーム表示を追加。",
    category: "開発アップデート",
    content: [
      "お問い合わせフォームのLP/HP間統合と、アナリティクス強化を行いました。",
      "",
      "主な変更点：",
      "・LP（ランディングページ）からのお問い合わせをHP APIに統合",
      "・CORS対応でクロスドメイン送信を実現",
      "・フォーム送信成功時にGA4 generate_leadイベントを発火",
      "・受信メールに送信元フォーム（HP/LP）を表示",
      "・投資ページからの問い合わせ種別をデフォルト選択",
    ].join("\n"),
  },
  {
    slug: "v0-5-0-pricing-features",
    date: "2026-02-25",
    title: "v0.5.0 料金プラン & 機能ページ刷新",
    summary:
      "フリーミアムモデル（500会計無料）に移行。機能紹介ページを10項目に統一。",
    category: "開発アップデート",
    content: [
      "料金体系と機能紹介ページを大幅にリニューアルしました。",
      "",
      "主な変更点：",
      "・フリーミアムモデル導入（最初の500会計は無料、全機能利用可能）",
      "・料金プランをワンプランに簡素化（月額¥30,000）",
      "・機能紹介ページを10項目に統一（指名・同伴管理・会計、シフト・出退勤管理、売上レポート・日報、不正防止、インボイス対応、給与計算、顧客管理、Web管理画面、キャストアプリ、オフライン対応）",
      "・パートナー・会社概要ページの文言修正",
    ].join("\n"),
  },
  {
    slug: "hp-beta-launch",
    date: "2026-02-23",
    title: "LunaPos 公式サイト ベータ公開",
    summary:
      "LunaPos公式サイト（lunapos.jp）をベータ公開しました。機能紹介・料金・お問い合わせなどの情報をご覧いただけます。",
    category: "お知らせ",
    content: [
      "LunaPos公式サイト（lunapos.jp）をベータ公開しました。",
      "",
      "公開時点の主な機能：",
      "・トップページ（機能紹介、料金プラン、FAQ）",
      "・機能紹介ページ",
      "・開発ロードマップ",
      "・投資・出資ページ",
      "・パートナー登録",
      "・お問い合わせフォーム（Resendメール送信）",
      "・メディア（オウンドメディア）",
      "・Google Analytics連携",
      "",
      "今後もサイトの改善を続けてまいります。フィードバックをお待ちしております。",
    ].join("\n"),
  },
];

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return newsItems.find((item) => item.slug === slug);
}

export function getLatestNews(count: number): NewsItem[] {
  return newsItems.slice(0, count);
}

export function getNewsByCategory(
  category: NewsItem["category"],
  count: number
): NewsItem[] {
  return newsItems.filter((item) => item.category === category).slice(0, count);
}
