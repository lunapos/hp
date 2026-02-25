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
    slug: "spring-campaign-2026",
    date: "2026-02-20",
    title: "【ダミー】春の新規導入キャンペーン開始",
    summary:
      "3月末までに新規ご契約いただいたお客様に、初月無料＋導入サポート無料の特典をご用意しています。",
    category: "キャンペーン",
    content:
      "これはダミーデータです。3月末までに新規ご契約いただいたお客様に、初月無料＋導入サポート無料の特典をご用意しております。この機会にぜひLunaPosをお試しください。",
  },
  {
    slug: "v1-4-0-release",
    date: "2026-02-18",
    title: "【ダミー】v1.4.0 キャストアプリのリニューアル",
    summary:
      "キャストアプリのUIを全面刷新。シフト提出がカレンダーから直接操作可能に。",
    category: "開発アップデート",
    content:
      "これはダミーデータです。キャストアプリのUIを全面刷新しました。シフト提出がカレンダーから直接操作できるようになり、個人売上の日次グラフ表示も追加しました。",
  },
  {
    slug: "maintenance-20260228",
    date: "2026-02-15",
    title: "【ダミー】サーバーメンテナンスのお知らせ（2/28）",
    summary:
      "2月28日(土) 4:00〜6:00にサーバーメンテナンスを実施いたします。",
    category: "メンテナンス",
    content:
      "これはダミーデータです。2月28日(土) 4:00〜6:00にサーバーメンテナンスを実施いたします。メンテナンス中はサービスをご利用いただけません。ご不便をおかけしますが、何卒ご了承ください。",
  },
  {
    slug: "v1-3-0-table-management",
    date: "2026-01-20",
    title: "【ダミー】v1.3.0 テーブル管理機能の追加",
    summary:
      "フロアマップからテーブル状況をリアルタイムに確認可能に。",
    category: "開発アップデート",
    content:
      "これはダミーデータです。フロアマップからテーブル状況をリアルタイムに確認可能になりました。テーブルごとの利用時間と金額を一覧表示し、空席状況をスタッフ間で共有する機能も追加しました。",
  },
  {
    slug: "official-line",
    date: "2026-01-10",
    title: "【ダミー】公式LINEアカウント開設",
    summary:
      "お問い合わせやサポートをLINEでも受け付けられるようになりました。",
    category: "お知らせ",
    content:
      "これはダミーデータです。お問い合わせやサポートをLINEでも受け付けられるようになりました。お気軽にご連絡ください。",
  },
  {
    slug: "lunapos-launch",
    date: "2026-01-05",
    title: "【ダミー】LunaPos正式リリース",
    summary:
      "ナイト業界に特化したPOSシステム「LunaPos」を正式にリリースいたしました。",
    category: "お知らせ",
    content:
      "これはダミーデータです。本日、LunaPosを正式にリリースいたしました。指名管理・会計・シフト管理の基本機能を搭載し、iPad対応のタッチ操作に最適化しています。",
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
