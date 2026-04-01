// お知らせ — 重要なアナウンスをここに追加する
import type { NewsItem } from "./news-types";

export const announcementItems: NewsItem[] = [
  {
    slug: "beta-test-start",
    date: "2026-04-01",
    title: "ベータテストを開始しました",
    summary:
      "LunaPos iPad版のベータテストを開始しました。導入店舗様と連携しながら、実運用での検証を進めてまいります。",
    category: "お知らせ",
    project: "Floor",
    content: [
      "LunaPos iPad版（フロア管理アプリ）のベータテストを本日より開始しました。",
      "",
      "導入店舗様と連携しながら、実際の営業環境での検証・改善を進めてまいります。",
      "フィードバックをもとに、正式リリースに向けて品質を高めていきます。",
    ].join("\n"),
  },
  {
    slug: "appstore-approved",
    date: "2026-04-01",
    title: "App Store 審査を通過しました",
    summary:
      "LunaPos iPad版が Apple の審査を通過しました。App Store からダウンロードいただけます。",
    category: "お知らせ",
    project: "Floor",
    content: [
      "LunaPos iPad版（フロア管理アプリ）が Apple の App Store 審査を通過しました。",
      "",
      "App Store からダウンロードいただけます。",
      "今後もアップデートを続けてまいりますので、ぜひご利用ください。",
    ].join("\n"),
  },
  {
    slug: "appstore-submission",
    date: "2026-03-21",
    title: "App Store へ審査申請を提出しました",
    summary:
      "LunaPos iPad版の App Store 審査申請を提出しました。承認され次第、App Store からダウンロードいただけるようになります。",
    category: "お知らせ",
    project: "Floor",
    content: [
      "LunaPos iPad版（フロア管理アプリ）の App Store 審査申請を提出しました。",
      "",
      "Appleの審査を通過次第、App Storeからダウンロードいただけるようになります。",
      "進捗があり次第、こちらでお知らせいたします。",
    ].join("\n"),
  },
  {
    slug: "hp-multilingual-support",
    date: "2026-03-01",
    title: "公式サイトが中国語・英語に対応しました",
    summary:
      "lunapos.jpが日本語・英語・中国語の3言語に対応。コラム記事も多言語で読めるようになりました。",
    category: "お知らせ",
    project: "HP",
    content: [
      "LunaPos公式サイト（lunapos.jp）が英語・中国語に対応しました。",
      "",
      "・サイト全体を日本語・英語・中国語の3言語で閲覧可能",
      "・コラム記事も言語別に読めるようになりました",
      "・英語は /en、中国語は /zh のURLでアクセスできます",
      "・日本語はこれまで通り / でアクセスできます",
      "",
      "英語サイト: https://lunapos.jp/en",
      "中国語サイト: https://lunapos.jp/zh",
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
