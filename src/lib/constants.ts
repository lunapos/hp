import {
  FileWarning,
  Users,
  Clock,
  BarChart3,
  WifiOff,
  Crown,
  Tablet,
  ShieldCheck,
  FileText,
  Monitor,
  Heart,
  Calculator,
} from "lucide-react";
import type {
  NavItem,
  PainPoint,
  Feature,
  Testimonial,
  FAQ,
  CompanyInfo,
} from "@/types";

export const BRAND = {
  name: "LunaPos",
  symbol: "\u262d",
  tagline: "\u30ca\u30a4\u30c8\u696d\u754c\u306e\u305f\u3081\u306e\u3001\u6b21\u4e16\u4ee3POS\u30b7\u30b9\u30c6\u30e0",
  url: "https://lunapos.jp",
  email: "info@lunapos.jp",
} as const;

export const NAV_ITEMS: NavItem[] = [
  { label: "ホーム", href: "/" },
  { label: "\u6a5f\u80fd\u7d39\u4ecb", href: "/features" },
  { label: "ニュース", href: "/news" },
  { label: "コラム", href: "/column" },
  { label: "\u304a\u554f\u3044\u5408\u308f\u305b", href: "/contact" },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { label: "\u30ed\u30fc\u30c9\u30de\u30c3\u30d7", href: "/roadmap" },
  { label: "運営について", href: "/company" },
  { label: "\u6295\u8cc7\u30fb\u51fa\u8cc7", href: "/investor" },
  { label: "パートナー", href: "/partner" },
];

export const PAIN_POINTS: PainPoint[] = [
  {
    icon: FileWarning,
    text: "\u624b\u66f8\u304d\u4f1d\u7968\u306e\u30df\u30b9\u304c\u591a\u304f\u3001\u4f1a\u8a08\u6642\u306b\u30c8\u30e9\u30d6\u30eb\u304c\u767a\u751f\u3059\u308b",
  },
  {
    icon: Users,
    text: "\u672c\u6307\u540d\u30fb\u5834\u5185\u6307\u540d\u30fb\u540c\u4f34\u306e\u7ba1\u7406\u304c\u714e\u96d1\u3067\u6b63\u78ba\u306b\u628a\u63e1\u3067\u304d\u306a\u3044",
  },
  {
    icon: Clock,
    text: "\u65e5\u5831\u4f5c\u6210\u306b\u6bce\u65e5\u4f55\u6642\u9593\u3082\u304b\u304b\u3063\u3066\u3044\u308b",
  },
  {
    icon: WifiOff,
    text: "\u30cd\u30c3\u30c8\u969c\u5bb3\u6642\u306b\u30b7\u30b9\u30c6\u30e0\u304c\u4f7f\u3048\u306a\u304f\u306a\u308b",
  },
  {
    icon: BarChart3,
    text: "\u65e2\u5b58POS\u304c\u30ca\u30a4\u30c8\u696d\u754c\u306e\u6599\u91d1\u4f53\u7cfb\u306b\u5408\u308f\u306a\u3044",
  },
];

export const FEATURE_HIGHLIGHTS: Feature[] = [
  {
    icon: Tablet,
    title: "iPad \u30cd\u30a4\u30c6\u30a3\u30d6",
    description:
      "Swift/SwiftUI\u3067\u958b\u767a\u3055\u308c\u305fiPad\u5c02\u7528\u30a2\u30d7\u30ea\u3002\u30cd\u30a4\u30c6\u30a3\u30d6\u306e\u64cd\u4f5c\u611f\u3067\u3001\u5fe9\u3057\u3044\u55b6\u696d\u4e2d\u3082\u30b9\u30c8\u30ec\u30b9\u306a\u304f\u64cd\u4f5c\u3067\u304d\u307e\u3059\u3002",
    details: [
      "\u9ad8\u901f\u8d77\u52d5\u30fb\u9ad8\u30d1\u30d5\u30a9\u30fc\u30de\u30f3\u30b9",
      "iPad\u753b\u9762\u30b5\u30a4\u30ba\u306b\u6700\u9069\u5316",
      "\u30c0\u30fc\u30af\u30e2\u30fc\u30c9\u6a19\u6e96",
    ],
  },
  {
    icon: WifiOff,
    title: "\u30aa\u30d5\u30e9\u30a4\u30f3\u5bfe\u5fdc",
    description:
      "\u30ed\u30fc\u30ab\u30eb\u30d5\u30a1\u30fc\u30b9\u30c8\u8a2d\u8a08\u3067\u3001\u30a4\u30f3\u30bf\u30fc\u30cd\u30c3\u30c8\u304c\u306a\u304f\u3066\u3082\u5168\u6a5f\u80fd\u304c\u52d5\u4f5c\u3002\u55b6\u696d\u4e2d\u306e\u30c0\u30a6\u30f3\u30bf\u30a4\u30e0\u30bc\u30ed\u3092\u5b9f\u73fe\u3057\u307e\u3059\u3002",
    details: [
      "\u30cd\u30c3\u30c8\u969c\u5bb3\u6642\u3082\u901a\u5e38\u7a3c\u50cd",
      "\u5fa9\u65e7\u6642\u306b\u81ea\u52d5\u30c7\u30fc\u30bf\u540c\u671f",
      "\u5b89\u5fc3\u306e\u5197\u9577\u6027",
    ],
  },
  {
    icon: Crown,
    title: "\u30ca\u30a4\u30c8\u696d\u754c\u7279\u5316",
    description:
      "\u30bb\u30c3\u30c8\u6599\u91d1\u30fb\u6307\u540d\u6599\u30fb\u30b5\u30fc\u30d3\u30b9\u6599\u30fb\u540c\u4f34\u306a\u3069\u3001\u30ca\u30a4\u30c8\u696d\u754c\u7279\u6709\u306e\u8907\u96d1\u306a\u6599\u91d1\u4f53\u7cfb\u306b\u5b8c\u5168\u5bfe\u5fdc\u3057\u3066\u3044\u307e\u3059\u3002",
    details: [
      "\u8907\u96d1\u306a\u6599\u91d1\u4f53\u7cfb\u306e\u81ea\u52d5\u8a08\u7b97",
      "\u6307\u540d\u7ba1\u7406\u30fb\u30ad\u30e3\u30b9\u30c8\u7ba1\u7406",
      "\u65e5\u5831\u30fb\u58f2\u4e0a\u30ec\u30dd\u30fc\u30c8\u81ea\u52d5\u751f\u6210",
    ],
  },
];

export const ALL_FEATURES: Feature[] = [
  {
    icon: Heart,
    title: "指名・同伴管理・会計",
    description:
      "本指名・場内指名・同伴をテーブルごとに管理し、セット料金・指名料・サービス料・税の自動計算でワンタップ精算。複雑な料金体系も正確に。",
    details: [
      "本指名・場内指名・指名なしの切替",
      "同伴キャストの紐付け・同伴料自動計算",
      "セット料金・サービス料・税の自動計算",
      "現金・カード・電子マネー対応",
      "レシート・領収書印刷",
    ],
  },
  {
    icon: Clock,
    title: "シフト・出退勤管理",
    description:
      "写真付きキャスト一覧からワンタップ出退勤。シフト予定の管理や勤怠履歴も自動で記録します。",
    details: [
      "フォトグリッドでワンタップ出退勤",
      "シフト予定の登録・管理",
      "勤怠履歴の自動記録",
      "HPへの在籍状況の自動反映",
    ],
  },
  {
    icon: BarChart3,
    title: "売上レポート・日報",
    description:
      "日次売上、キャスト別成績、メニュー別ランキングを自動集計。閉店後の日報作成が不要になります。",
    details: [
      "売上サマリーの自動生成",
      "支払方法別集計",
      "キャスト売上ランキング",
      "レジ精算機能",
    ],
  },
  {
    icon: ShieldCheck,
    title: "不正防止（操作ログ）",
    description:
      "全操作を自動記録。価格変更・割引・取消などの履歴を管理画面からいつでも確認でき、安心して店舗を任せられます。",
    details: [
      "全操作のタイムスタンプ記録",
      "価格変更・割引・取消の履歴",
      "管理画面からリアルタイム確認",
      "追加料金なしで標準搭載",
    ],
  },
  {
    icon: FileText,
    title: "インボイス対応",
    description:
      "適格請求書（インボイス）の要件を満たすレシート・領収書を発行。登録番号・税率・税額を自動で印字します。",
    details: [
      "登録番号（T+13桁）の自動印字",
      "税率区分・税額の明記",
      "設定画面でON/OFF切替",
      "領収書・レシート両対応",
    ],
  },
  {
    icon: Calculator,
    title: "給与計算",
    description:
      "バック率・時給・指名バックなど店舗独自の給与体系に対応。月末の明細作成を自動化します。",
    details: [
      "店舗独自のバック率設定",
      "指名・同伴・ドリンクバック対応",
      "時給＋歩合の混合計算",
      "給与明細の自動生成",
    ],
  },
  {
    icon: Users,
    title: "顧客管理",
    description:
      "来店履歴・好み・担当キャストなど顧客情報を一元管理。リピーター獲得や接客品質の向上に。",
    details: [
      "来店履歴・利用金額の自動記録",
      "顧客メモ・好みの登録",
      "担当キャストの紐付け",
      "顧客別の売上分析",
    ],
  },
  {
    icon: Monitor,
    title: "Web管理画面",
    description:
      "外出先からスマホ・PCで売上やキャストの成績をリアルタイムに確認。メニュー設定や給与計算もWebで完結。",
    details: [
      "売上・指名数をリアルタイム確認",
      "メニュー・料金設定",
      "キャスト管理・シフト管理",
      "スマホ・PC・タブレット対応",
    ],
  },
  {
    icon: Tablet,
    title: "キャストアプリ",
    description:
      "キャスト専用のiPhoneアプリ。自分のシフト・売上・指名数をいつでも確認でき、シフト提出もアプリから。",
    details: [
      "個人売上・指名数の確認",
      "シフト提出・変更",
      "出退勤打刻",
      "給与明細の閲覧",
    ],
  },
  {
    icon: WifiOff,
    title: "オフライン対応",
    description:
      "SwiftDataによるローカルファースト設計。インターネット不要で全機能が動作し、営業中のダウンタイムゼロを実現。",
    details: [
      "ネット障害時も通常稼働",
      "データ自動同期",
      "安心の冗長性",
    ],
  },
];

export const PRICING_PLAN = {
  price: "¥30,000",
  description: "迷わせない、ワンプラン。最初の500会計は無料予定です。",
  features: [
    "指名・同伴管理・会計",
    "シフト・出退勤管理",
    "売上レポート・日報",
    "不正防止（操作ログ）",
    "インボイス対応",
    "給与計算",
    "顧客管理",
    "Web管理画面",
    "キャストアプリ",
    "オフライン対応",
  ],
  freeNote: "リリース後、最初の500会計（累計）は無料で全機能をご利用いただける予定です。事前登録いただくとリリース時にご案内します。",
  aiNote: "売上予測・シフト最適化・顧客分析など、AIを活用した機能を順次リリース予定です。AI機能のご利用には追加料金が発生する場合があります。",
};

export const TESTIMONIALS: Testimonial[] = [];

export const FAQS: FAQ[] = [
  {
    question: "導入までどのくらいの期間がかかりますか？",
    answer:
      "お申し込みから最短3営業日でご利用いただけます。初期設定もシンプルなので、ITに詳しくない方でもすぐに使い始められます。",
  },
  {
    question: "データのエクスポートはできますか？",
    answer:
      "はい、売上データや顧客情報などをCSV形式でエクスポートできます。確定申告や税理士への共有、独自の分析にご活用いただけます。",
  },
  {
    question: "どの端末で使えますか？",
    answer:
      "現在はiPadに対応しています。店舗での利用に最適化された操作画面をご提供しています。",
  },
  {
    question: "解約はいつでもできますか？",
    answer:
      "はい、解約はいつでも可能です。最低利用期間の縛りはございません。公式LINEからご連絡いただければ、すぐにお手続きいたします。",
  },
  {
    question: "無料で使えますか？",
    answer:
      "はい、累計500会計まで完全無料でご利用いただけます。クレジットカードの登録も不要で、全機能をお使いいただけます。501会計目から月額¥30,000（税込）となります。",
  },
  {
    question: "店舗独自の給与体系に対応できますか？",
    answer:
      "はい、バック率や時給設定など、店舗ごとの給与ルールに合わせた柔軟な設定が可能です。ただし、すべての給与体系に対応できるとは限りませんので、詳しくはお問い合わせください。",
  },
];

export const COMPANY_INFO: CompanyInfo[] = [
  { label: "屋号", value: "LunaPos" },
  { label: "所在地", value: "東京都世田谷区" },
  {
    label: "事業内容",
    value: "ナイト業界向けPOSシステムの開発・提供",
  },
  { label: "開業", value: "2026年" },
  { label: "URL", value: "https://lunapos.jp" },
];
