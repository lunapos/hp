export type Project = "HP" | "LP" | "Floor" | "Admin" | "Cast";

export const PROJECT_LABELS: Record<Project, { label: string; color: string }> =
  {
    HP: { label: "HP", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    LP: { label: "LP", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    Floor: { label: "Floor", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    Admin: { label: "Admin", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    Cast: { label: "Cast", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  };

export interface NewsItem {
  slug: string;
  date: string;
  title: string;
  summary: string;
  category: "お知らせ" | "開発アップデート" | "メンテナンス" | "キャンペーン";
  categoryLabel?: string; // 翻訳されたカテゴリ表示名
  project?: Project;
  content?: string;
}

export const newsItems: NewsItem[] = [
  // --- 2026-03-02 ---
  {
    slug: "admin-cast-deploy",
    date: "2026-03-02",
    title: "管理画面・キャスト画面を公開しました",
    summary:
      "オーナー向け管理画面（admin.lunapos.jp）とキャスト専用画面（cast.lunapos.jp）をVercelにデプロイしました。",
    category: "お知らせ",
    content: [
      "LunaPosのWeb画面2つを公開しました。",
      "",
      "## オーナー管理画面（admin.lunapos.jp）",
      "・売上レポートの確認",
      "・キャスト・テーブル・メニュー管理",
      "・CSVエクスポート機能",
      "",
      "## キャスト専用画面（cast.lunapos.jp）",
      "・ログイン・ダッシュボード",
      "・シフト管理（提出・確認）",
      "・個人売上・指名実績の確認",
      "・ポートフォリオ・実績証明書",
      "",
      "どちらもFloor（iPadアプリ）と同じSupabaseデータベースを共有し、リアルタイムでデータが連動します。",
    ].join("\n"),
  },
  {
    slug: "admin-v0-4-0",
    date: "2026-03-02",
    title: "v0.4.0 Admin: キャスト管理・メニュー管理・店舗設定",
    summary:
      "オーナー管理画面にキャスト・メニュー・テーブル管理、店舗設定、CSVエクスポートを実装。Vercelデプロイ完了。",
    category: "開発アップデート",
    project: "Admin",
    content: [
      "オーナー管理画面（admin.lunapos.jp）の主要機能を実装しました。",
      "",
      "## 管理機能",
      "・キャスト管理（一覧・追加・編集）",
      "・メニュー管理（ドリンク・フード・セット料金）",
      "・テーブル管理（ルーム・席配置）",
      "・店舗設定（税率・サービス料率・指名料）",
      "",
      "## レポート・エクスポート",
      "・売上レポートダッシュボード",
      "・CSVエクスポート（BOM付きExcel対応）",
      "",
      "## インフラ",
      "・Supabase接続クライアント",
      "・GitHub リポジトリ（lunapos/admin）→ Vercel自動デプロイ",
      "・カスタムドメイン: admin.lunapos.jp",
    ].join("\n"),
  },
  {
    slug: "cast-v0-3-0-floor",
    date: "2026-03-02",
    title: "v0.3.0 Cast: シフト提出・ポートフォリオ / Floor: 会計・レポート",
    summary:
      "キャスト画面にシフト管理・ポートフォリオ機能を実装。Floor側はキャスト編集・同期エラーUIを追加。",
    category: "開発アップデート",
    project: "Cast",
    content: [
      "キャスト専用画面（cast.lunapos.jp）とFloorの機能を拡充しました。",
      "",
      "## Cast 主要機能",
      "・ログイン認証・ダッシュボード",
      "・シフト提出・確認",
      "・個人売上・指名・同伴の実績表示",
      "・ポートフォリオ機能・実績証明書発行",
      "・データ削除リクエスト（GDPR対応）",
      "",
      "## Floor 追加機能",
      "・キャスト編集フォーム（EditCastSheet）",
      "・同期失敗時のエラー表示バナー（5秒自動消去）",
      "",
      "## インフラ",
      "・GitHub リポジトリ（lunapos/cast）→ Vercel自動デプロイ",
      "・カスタムドメイン: cast.lunapos.jp",
    ].join("\n"),
  },
  {
    slug: "hp-v0-14-0-article-navigation",
    date: "2026-03-02",
    title: "v0.14.0 HP: 記事ナビゲーション追加",
    summary:
      "ニュース・コラムの記事詳細ページに「前の記事」「次の記事」ナビゲーションを追加しました。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "記事の読み進めやすさを改善しました。",
      "",
      "## 変更内容",
      "・ニュース詳細ページに前後記事ナビゲーションを追加",
      "・コラム詳細ページに前後記事ナビゲーションを追加",
      "・日本語・英語・中国語の翻訳キーを追加",
      "・ホバー時にゴールドカラーで遷移先タイトルを表示",
      "",
      "記事を読み終わった後、一覧に戻らずに次の記事へ移動できるようになりました。",
    ].join("\n"),
  },
  // --- 2026-03-01 ---
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
    slug: "hp-v0-13-0-i18n",
    date: "2026-03-01",
    title: "v0.13.0 多言語対応（英語・中国語）",
    summary:
      "next-intlによる多言語対応を実装。英語・中国語のUIテキスト翻訳、記事の言語別表示、多言語サイトマップ（hreflang）を追加。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "公式サイトに英語・中国語の多言語対応を実装しました。",
      "",
      "主な変更点：",
      "・next-intl によるi18nルーティング（ja/en/zh）",
      "・日本語はURLプレフィックスなし（as-needed モード）",
      "・全UIテキストの英語・中国語翻訳ファイル追加",
      "・コラム記事の言語別ディレクトリ対応（content/column/en/, content/column/zh/）",
      "・ニュースの翻訳データ追加（news-en.ts, news-zh.ts）",
      "・多言語サイトマップ（hreflang alternates）",
      "・Supabase middleware と intl middleware の統合",
      "・SSGページの setRequestLocale 対応",
    ].join("\n"),
  },
  // --- 2026-02-26 ---
  {
    slug: "hp-v0-12-0-nav-screenshots",
    date: "2026-02-26",
    title: "v0.12.0 ナビ整理・コラムリネーム・アプリスクショ掲載",
    summary:
      "ヘッダーナビを5項目に絞り込み、メディア→コラムにリネーム（/media→/column）、ヒーロー&スクショセクションに実際のアプリ画面を掲載。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "## ナビゲーション分割",
      "",
      "ヘッダーとフッターでターゲットが異なるため、ナビゲーション要素を分離しました。",
      "",
      "### ヘッダー（店舗オーナー向け・5項目）",
      "・ホーム / 機能紹介 / ニュース / コラム / お問い合わせ",
      "",
      "### フッターへ移動",
      "・ロードマップ / 運営について / 投資・出資 / パートナー",
      "",
      "## メディア → コラムへリネーム",
      "ブログ的なコンテンツであることを明確にするため「メディア」を「コラム」に変更。",
      "URLパスも `/media` → `/column` に変更。",
      "",
      "## アプリスクリーンショット掲載",
      "ヒーローセクションのモックアップを実際のFloorアプリ画面に差し替え。",
      "トップページにフロアマップ・キャスト管理の開発中スクショセクションを追加。",
    ].join("\n"),
  },
  {
    slug: "app-v0-8-0-ux-visibility",
    date: "2026-02-26",
    title: "v0.8.0 Floor: 視認性・操作性を大幅改善",
    summary:
      "ダークモード配色改善、テーブル色分け、フォントサイズ拡大、残り時間表示、伝票フォーマット統一、ツールバーテキスト表示を実施。",
    category: "開発アップデート",
    project: "Floor",
    content: [
      "Floor アプリの視認性と操作性を大幅に改善しました。暗い店内で酔った状態でも操作しやすいUIを目指しています。",
      "",
      "【ダークモード改善】",
      "・ダーク/ライト切り替えが正しく動作するよう修正（AppStorage永続化）",
      "・ダークモードの背景・カード・ボーダーのコントラストを強化",
      "・テーブルステータスを色系統で区別（使用中=緑系、会計待ち=琥珀系、空席=紫系）",
      "",
      "【視認性向上】",
      "・本日売上を28pt太字ゴールドで目立つ表示に変更",
      "・テーブルカードのフォントサイズ拡大（テーブル名・金額・時間）",
      "・伝票のフォントサイズ拡大（オーダー行・合計・ボタン）",
      "・キャストカードを6列グリッドに変更、顔写真アイコン対応",
      "・キャスト出勤経過時間の表示を追加",
      "",
      "【時間管理】",
      "・ClockArcを残り時間表示に変更（経過時間→残り時間）",
      "・時間超過時は「残 0分」+「+X分 超過」で固定表示",
      "",
      "【伝票フォーマット統一】",
      "・セット・延長をドリンクと同じ「単価 × 数量」フォーマットに統一",
      "・セット行で人数の+/-操作が可能（× N名表記）",
      "・2名以上の場合は行下に合計金額を表示",
      "",
      "【操作性】",
      "・ツールバーボタンにテキストラベル追加（指名・転卓・延長・会計）",
      "・延長シートのUI簡素化（重複表記を削除）",
    ].join("\n"),
  },
  // --- 2026-02-25 ---
  {
    slug: "hp-v0-11-1-partner-register-fix",
    date: "2026-02-25",
    title: "v0.11.1 パートナー登録バリデーション修正",
    summary:
      "パスワード最小文字数を6文字に変更。リファラルコード生成のフォールバック追加とエラーメッセージ詳細化。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "パートナー登録のバリデーションとエラーハンドリングを改善しました。",
      "",
      "・パスワードの最小文字数を6文字に変更（Supabase Auth要件に合わせて）",
      "・HTML minLength属性もフォーム側で6に設定",
      "・リファラルコード生成RPCが無い場合のJSフォールバック追加",
      "・パートナー登録失敗時のエラーメッセージに詳細を含めるよう改善",
    ].join("\n"),
  },
  {
    slug: "hp-v0-11-0-partner-dashboard",
    date: "2026-02-25",
    title: "v0.11.0 パートナーダッシュボード全面強化",
    summary:
      "ダッシュボードをタブ化し、CSS棒グラフ・期間フィルタ・クリック分析・報酬CSV出力・プロフィール編集・通知バッジを追加。サイトマップにニュース詳細ページも追加。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "パートナーダッシュボードを全面的に強化しました。",
      "",
      "主な変更点：",
      "・ダッシュボードを4タブ構成に変更（概要/成約/報酬/設定）",
      "・統計カードを6つに拡張（CVR・確定成約を追加）",
      "・期間フィルタ（7日/30日/90日/全期間）で統計切り替え",
      "・CSS棒グラフでクリック・成約のトレンド表示",
      "・ページ別クリック内訳の横棒グラフ",
      "・報酬サマリー（合計/今月/未払い）＆ CSV出力",
      "・プロフィール編集機能（名前/電話/パートナー種別）",
      "・前回ログイン以降の新規通知バッジ",
      "・sitemapにニュース詳細ページを追加",
      "・開発アップデートの日付順ソートを修正",
    ].join("\n"),
  },
  {
    slug: "hp-v0-10-0-ux-improvements",
    date: "2026-02-25",
    title: "v0.10.0 UX改善 & モバイル対応強化",
    summary:
      "UI統一（ContentCard共有）、プロジェクトフィルタリング、ヘッダー固定化、機能紹介のスマホ対応、事前登録表記に変更。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "サイト全体のUXとモバイル対応を大幅に改善しました。",
      "",
      "主な変更点：",
      "・ContentCard共有コンポーネントでメディア・ニュースのUI統一",
      "・開発アップデートにプロジェクトフィルタリング（すべて/HP/App）",
      "・PCヘッダーのsticky修正（overflow-x: clip対応）",
      "・スマホヘッダーをfixedに変更（スクロール後もメニュー操作可能）",
      "・モバイルメニュー改善（body scroll lock、X閉じるボタン）",
      "・機能紹介ページのスマホレイアウト最適化（大アイコン非表示）",
      "・製品リリース前の表記を事前登録・ウェイティングリスト向けに修正",
      "・ロゴクリックでトップへスムーズスクロール",
      "・不要ページ削除（/news/announcements, /news/updates）",
    ].join("\n"),
  },
  {
    slug: "lp-v0-5-0-ui-mobile-fix",
    date: "2026-02-25",
    title: "v0.5.0 LP UI改善 & スマホメニュー修正",
    summary:
      "テーマトグルをスライド式に変更、ニュース関連をHP統合で削除、フォームUI改善、スマホメニューのz-index問題を修正。",
    category: "開発アップデート",
    project: "LP",
    content: [
      "LPのUI改善とスマホメニューの問題を修正しました。",
      "",
      "主な変更点：",
      "・テーマトグルをスライド式に変更",
      "・ニュース関連セクションを削除（HPに統合）",
      "・フォームの必須項目に赤い*マークを追加",
      "・スマホメニューをheader外に移動しz-index問題を修正",
      "・.envをgit管理から除外（APIキー漏洩対応）",
    ].join("\n"),
  },
  {
    slug: "lp-v0-4-0-site-infra",
    date: "2026-02-25",
    title: "v0.4.0 LP サイト基盤整備",
    summary:
      "sitemap/robots追加、ニュースセクション追加、GA4イベント、API URL修正を実施。",
    category: "開発アップデート",
    project: "LP",
    content: [
      "LPサイトの基盤を整備しました。",
      "",
      "主な変更点：",
      "・sitemap.xml / robots.txt を追加（lp.lunapos.jp）",
      "・ニュース・開発アップデートセクション追加",
      "・フォーム送信成功時にGA4 generate_leadイベントを発火",
      "・お問い合わせAPIのURL修正（www.lunapos.jp → lunapos.jp）",
    ].join("\n"),
  },
  {
    slug: "lp-v0-3-0-freemium-api",
    date: "2026-02-25",
    title: "v0.3.0 LP フリーミアム料金 & API統合",
    summary:
      "フリーミアム料金表記に更新。お問い合わせAPIをHPに統合しVercel Functions廃止。",
    category: "開発アップデート",
    project: "LP",
    content: [
      "LPの料金表記とAPI基盤を更新しました。",
      "",
      "主な変更点：",
      "・フリーミアムモデルに合わせて料金表記を更新",
      "・料金プランをワンプランに簡素化",
      "・お問い合わせAPIをHPに統合しVercel Functions廃止",
      "・CORS対応でクロスドメイン送信を実現",
    ].join("\n"),
  },
  {
    slug: "app-v0-7-0-dark-mode-ui",
    date: "2026-02-25",
    title: "v0.7.0 Floor: ダークモード統一 & UI改善",
    summary:
      "フロア全体をダークモードに統一。ダーク/ライト切り替えボタン、テーブルカード拡大、入店受付UI改善を実施。",
    category: "開発アップデート",
    project: "Floor",
    content: [
      "Floor アプリのビジュアルとUIを大幅に改善しました。",
      "",
      "主な変更点：",
      "・ダークモード統一（ナビバーに合わせてフロア全体をダーク化、高級感を演出）",
      "・ダーク/ライト切り替えボタンをナビバーに追加（AppStorage永続化）",
      "・テーマカラーをUIColor adaptive対応（ライト/ダーク自動切り替え）",
      "・テーブルカードを280×240に拡大（視認性向上）",
      "・テーブル間のスペースを28pxに拡大",
      "・入店受付ボタンを画面下部に移動（ゴールド背景で目立つデザイン）",
      "・人数選択をホイールPickerに変更（1〜99名対応）",
      "・ナビバーロゴを「☽ Luna POS」にシンプル化",
      "・空席テーブル・使用中テーブルの背景色をダーク対応",
    ].join("\n"),
  },
  {
    slug: "app-v0-6-0-supabase-backend",
    date: "2026-02-25",
    title: "v0.6.0 Floor: Supabase バックエンド統合",
    summary:
      "Supabaseバックエンドを構築。マルチテナントRLS、Swift SDK連携、オフライン対応SyncEngineを実装。",
    category: "開発アップデート",
    project: "Floor",
    content: [
      "LunaPos App にSupabaseバックエンドを統合しました。",
      "",
      "主な変更点：",
      "・Supabase CLIセットアップ & マイグレーションSQL作成（18テーブル）",
      "・全テーブルにtenant_id + RLS（Row Level Security）ポリシー設定",
      "・テストデータ投入（seed.sql: 1店舗、3ルーム、8テーブル、6キャスト、12メニュー）",
      "・Swift SDK連携（SupabaseService.swift: クエリメソッド一式）",
      "・SyncEngine.swift（NWPathMonitor によるオンライン/オフライン検知、書き込み同期）",
      "・DTOs.swift（Supabase用データ転送オブジェクト、snake_case変換）",
      "・StoreSettings.swift（店舗設定をSupabaseから動的読み込み）",
      "・PriceCalculator をStoreSettings対応に更新",
      "・端末認証フロー（デバイストークンによるJWT取得設計）",
      "・Swift 6 Strict Concurrency対応（@MainActor活用）",
    ].join("\n"),
  },
  {
    slug: "hp-v0-9-0-news-tabs-badges",
    date: "2026-02-25",
    title: "v0.9.0 ニュースタブUI & プロジェクト別バッジ",
    summary:
      "ニュースページにタブ切り替えUI、開発アップデートにプロジェクト別バッジ（HP/Floor/Cast/Admin）を追加。スマホ横スクロール修正。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "ニュースページとモバイル表示を改善しました。",
      "",
      "主な変更点：",
      "・ニュースページにタブUI（お知らせ / 開発アップデート切り替え）",
      "・メニューバーに「ニュース」リンクを追加",
      "・開発アップデートにプロジェクト別バッジ表示（HP/Floor/Cast/Admin）",
      "・Floor/Cast/Adminの開発アップデートを追加",
      "・スマホ版の横スクロール防止（overflow-x: hidden）",
      "・スマホメニューの背景タップで閉じるよう修正",
    ].join("\n"),
  },
  {
    slug: "hp-v0-8-0-light-mode",
    date: "2026-02-25",
    title: "v0.8.0 ライトモード & UI刷新",
    summary:
      "ダーク/ライトモード切り替え、お知らせ・開発アップデートセクション、ファビコン刷新、スライド式テーマトグルを追加。",
    category: "開発アップデート",
    project: "HP",
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
    slug: "hp-v0-7-0-media",
    date: "2026-02-25",
    title: "v0.7.0 メディア機能",
    summary:
      "メディア記事ページを追加。タグ別分類、ページネーション、サイトマップ自動生成に対応。",
    category: "開発アップデート",
    project: "HP",
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
    slug: "hp-v0-6-0-form-analytics",
    date: "2026-02-25",
    title: "v0.6.0 フォーム統合 & アナリティクス",
    summary:
      "LP・HP間のお問い合わせフォームを統合。GA4イベント計測、送信元フォーム表示を追加。",
    category: "開発アップデート",
    project: "HP",
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
    slug: "hp-v0-5-0-pricing-features",
    date: "2026-02-25",
    title: "v0.5.0 料金プラン & 機能ページ刷新",
    summary:
      "フリーミアムモデル（500会計無料）に移行。機能紹介ページを10項目に統一。",
    category: "開発アップデート",
    project: "HP",
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
    slug: "app-v0-5-0-freemium",
    date: "2026-02-25",
    title: "v0.5.0 フリーミアムモデル導入",
    summary:
      "月500会計まで無料のフリーミアムモデルに移行。料金体系をワンプランに簡素化。",
    category: "開発アップデート",
    content: [
      "LunaPos App の料金体系をフリーミアムモデルに移行しました。",
      "",
      "主な変更点：",
      "・フリーミアムモデル導入（最初の500会計/月は無料、全機能利用可能）",
      "・料金プランをワンプランに簡素化（月額¥30,000）",
      "・HP・LPの料金表記を同期更新",
    ].join("\n"),
  },
  // --- 2026-02-24 ---
  {
    slug: "hp-v0-4-0-ga-roadmap",
    date: "2026-02-24",
    title: "v0.4.0 GA連携・ロードマップ・404ページ",
    summary:
      "Google Analytics連携、開発ロードマップの進捗ベース表示、404ページを追加。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "サイトの計測基盤と各種ページを整備しました。",
      "",
      "主な変更点：",
      "・Google Analytics（G-5DHKDT51M1）連携",
      "・開発ロードマップを進捗ベースの表現に変更",
      "・404ページ追加",
      "・Resend APIキー未設定時のフォールバック処理",
    ].join("\n"),
  },
  {
    slug: "app-v0-4-0-admin-management",
    date: "2026-02-24",
    title: "v0.4.0 Admin: キャスト管理・メニュー管理・店舗設定",
    summary:
      "管理画面にキャスト登録・編集、カテゴリ別メニュー管理、ルーム・テーブル設定を追加。",
    category: "開発アップデート",
    project: "Admin",
    content: [
      "Admin（オーナー管理画面）にスタッフ・メニュー管理と店舗設定機能を追加しました。",
      "",
      "主な変更点：",
      "・キャスト管理（新規登録・プロフィール編集・写真管理）",
      "・キャスト状態表示（出勤中/退勤）・本日のパフォーマンス統計",
      "・カテゴリ別メニュー管理（追加・有効/無効切り替え・折りたたみ表示）",
      "・店舗設定（ルーム管理・テーブル割り当て・座標設定）",
    ].join("\n"),
  },
  {
    slug: "hp-v0-3-0-media",
    date: "2026-02-24",
    title: "v0.3.0 オウンドメディア基盤",
    summary:
      "メディア（記事）ページの基盤を実装。記事の公開・閲覧ができるようになりました。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "HPサイトにオウンドメディア機能の基盤を追加しました。",
      "",
      "主な変更点：",
      "・メディアページ（/media）の新設",
      "・記事詳細ページ（/media/[slug]）",
      "・記事データの管理構造",
    ].join("\n"),
  },
  {
    slug: "app-v0-3-0-cast-shift-checkout",
    date: "2026-02-24",
    title: "v0.3.0 Cast: シフト提出・ポートフォリオ / Floor: 会計・レポート",
    summary:
      "キャストアプリにシフト提出・ポートフォリオ機能、フロアアプリに会計・レポート機能を追加。",
    category: "開発アップデート",
    project: "Cast",
    content: [
      "Cast アプリとFloor アプリに主要機能を追加しました。",
      "",
      "【Cast アプリ】",
      "・シフト希望提出（月別カレンダー、出勤可/不可トグル、時間帯入力）",
      "・月次シフトサマリー統計",
      "・パフォーマンス証明書の自動生成（在籍期間・月平均売上・指名数・リピート率）",
      "・ポートフォリオ公開のオプトイン/オプトアウト同意",
      "・データプライバシー管理（データ削除リクエスト、30日保持期間）",
      "",
      "【Floor アプリ】",
      "・会計ページ（明細一覧、割引適用、決済手段選択）",
      "・複数決済対応（現金・カード・電子マネー・ツケ）",
      "・サービス料（40%）・消費税（10%）自動計算",
      "・売上レポート（日次売上・決済方法別内訳・キャスト別ランキング）",
      "・レジ締め（出金記録付き現金照合）",
    ].join("\n"),
  },
  // --- 2026-02-23 ---
  {
    slug: "lp-v0-2-0-contact-email",
    date: "2026-02-23",
    title: "v0.2.0 LP お問い合わせフォーム & メール送信",
    summary:
      "お問い合わせフォームのメール送信機能を実装。Resend API連携、404ページを追加。",
    category: "開発アップデート",
    project: "LP",
    content: [
      "LPにお問い合わせフォームのメール送信機能を追加しました。",
      "",
      "主な変更点：",
      "・Resend APIによるメール送信導入",
      "・メールアドレス設定",
      "・Vercel Serverless Functions設定",
      "・404ページ追加",
      "・API routeのSPAリライト除外",
    ].join("\n"),
  },
  {
    slug: "lp-v0-1-0-initial",
    date: "2026-02-23",
    title: "v0.1.0 LP初期実装",
    summary:
      "LunaPos LPサイト（lp.lunapos.jp）の初期実装。ヒーロー、機能紹介、料金、お問い合わせ、GA4連携。",
    category: "開発アップデート",
    project: "LP",
    content: [
      "LunaPos LPサイト（lp.lunapos.jp）の初期バージョンを実装しました。",
      "",
      "主な変更点：",
      "・ヒーローセクション・機能紹介・料金プラン・お問い合わせフォーム",
      "・Google Analytics（G-59GQFP47H4）連携",
      "・Vercel SPAリライト設定",
      "・モバイルメニューの外タップで閉じる機能",
      "・顧客管理表記を売上分析に修正",
    ].join("\n"),
  },
  {
    slug: "hp-v0-2-0-contact-email",
    date: "2026-02-23",
    title: "v0.2.0 お問い合わせフォーム & メール送信",
    summary:
      "Resendによるメール送信を導入。お問い合わせフォームからの自動メール通知が可能に。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "お問い合わせフォームとメール送信基盤を整備しました。",
      "",
      "主な変更点：",
      "・Resend APIによるメール送信導入",
      "・お問い合わせフォームの改善",
      "・ページ別の専用メールアドレス設定",
      "・Supabaseエラーがフォーム送信をブロックしないよう修正",
    ].join("\n"),
  },
  {
    slug: "app-v0-2-0-table-order-admin-reports",
    date: "2026-02-23",
    title: "v0.2.0 Floor: テーブル管理・オーダー / Admin: 売上レポート",
    summary:
      "フロアアプリにテーブル詳細・オーダー入力・指名管理、管理画面に売上レポート・シフト表示を追加。",
    category: "開発アップデート",
    project: "Floor",
    content: [
      "Floor アプリとAdmin アプリに主要機能を追加しました。",
      "",
      "【Floor アプリ】",
      "・テーブル詳細画面（ゲスト数管理、時間表示）",
      "・カテゴリ別メニューオーダー（ドリンク・ボトル・フード・レディースドリンク・その他・経費）",
      "・カスタムアイテム追加機能",
      "・指名管理（本指名・場内指名の料金設定）",
      "・同伴（ドウハン）機能・セット時間延長",
      "・伝票集約・単価調整",
      "",
      "【Admin アプリ】",
      "・日次売上レポート（売上合計・組数・客単価・平均滞在時間）",
      "・決済方法別内訳（構成比表示）",
      "・キャストパフォーマンスランキング（指名数・売上）",
      "・人気メニューTOP5（売上金額順）",
      "・週次シフト表示（日別キャスト数・色分け強度表示）",
    ].join("\n"),
  },
  {
    slug: "hp-v0-1-0-initial",
    date: "2026-02-23",
    title: "v0.1.0 HP初期実装",
    summary:
      "LunaPos公式サイトの初期実装。トップページ、機能紹介、料金、ロードマップ、投資・パートナー、会社概要を公開。",
    category: "開発アップデート",
    project: "HP",
    content: [
      "LunaPos公式サイト（lunapos.jp）の初期バージョンを実装しました。",
      "",
      "実装ページ：",
      "・トップページ（ヒーロー、課題提起、機能紹介、料金、FAQ）",
      "・機能紹介ページ",
      "・開発ロードマップ",
      "・投資・出資ページ",
      "・パートナー登録・ログイン",
      "・会社概要ページ",
      "・お問い合わせフォーム",
      "・プライバシーポリシー・利用規約・特商法ページ",
    ].join("\n"),
  },
  {
    slug: "app-v0-1-0-initial",
    date: "2026-02-23",
    title: "v0.1.0 Floor / Cast / Admin 初期実装",
    summary:
      "Floor（フロアマップ・キャスト管理）、Cast（ダッシュボード・売上ランキング）、Admin の3アプリ初期実装。",
    category: "開発アップデート",
    project: "Floor",
    content: [
      "LunaPos App（Floor / Cast / Admin）の初期バージョンを実装しました。",
      "",
      "【Floor アプリ（iPad - ボーイ向け）】",
      "・リアルタイムフロアマップ（テーブル状態の視覚表示・ドラッグ操作）",
      "・マルチルーム対応（タブ切り替え）",
      "・テーブルステータス管理（空席・使用中・会計待ち）",
      "・リアルタイム売上カウンター",
      "・キャスト一覧（写真プロフィール・出退勤状態・打刻機能）",
      "・管理画面（メニュー管理・テーブル配置エディタ・ルーム設定）",
      "",
      "【Cast アプリ（スマホ - キャスト向け）】",
      "・キャストログイン画面（ID/パスワード認証・セッション永続化）",
      "・ダッシュボード（本日の勤務状態・出勤時刻・実績表示）",
      "・テーブル別売上明細（指名種別バッジ付き）",
      "・日次売上ランキング（TOP3にメダル表示）",
      "・月別シフトカレンダー（確定シフト表示・稼働時間・給与見込み）",
      "",
      "【Admin アプリ（PC - オーナー向け）】",
      "・マルチタブ管理画面の基盤構築",
      "・取引履歴一覧",
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

type NewsTranslation = { title: string; summary: string; category: string; content?: string };

let translationsCache: Record<string, Record<string, NewsTranslation>> = {};

async function getTranslations(locale: string): Promise<Record<string, NewsTranslation>> {
  if (locale === "ja") return {};
  if (translationsCache[locale]) return translationsCache[locale];
  try {
    if (locale === "en") {
      const { newsTranslationsEn } = await import("./news-en");
      translationsCache[locale] = newsTranslationsEn;
      return newsTranslationsEn;
    }
    if (locale === "zh") {
      const { newsTranslationsZh } = await import("./news-zh");
      translationsCache[locale] = newsTranslationsZh;
      return newsTranslationsZh;
    }
  } catch {
    // 翻訳ファイルがない場合は空
  }
  return {};
}

function localizeItem(item: NewsItem, translations: Record<string, NewsTranslation>): NewsItem {
  const t = translations[item.slug];
  if (!t) return item;
  return {
    ...item,
    title: t.title,
    summary: t.summary,
    // category は原文のまま（フィルタ用）、表示は categoryLabel
    categoryLabel: t.category,
    content: t.content ?? item.content,
  };
}

export function getLocalizedNewsItems(locale: string): Promise<NewsItem[]> {
  return getTranslations(locale).then((t) =>
    newsItems.map((item) => localizeItem(item, t))
  );
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return newsItems.find((item) => item.slug === slug);
}

export async function getLocalizedNewsBySlug(slug: string, locale: string): Promise<NewsItem | undefined> {
  const items = await getLocalizedNewsItems(locale);
  return items.find((item) => item.slug === slug);
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

export async function getLocalizedNewsByCategory(
  category: NewsItem["category"],
  count: number,
  locale: string
): Promise<NewsItem[]> {
  const items = await getLocalizedNewsItems(locale);
  // locale が ja 以外の場合、翻訳されたカテゴリ名で一致しないので原文カテゴリで一旦フィルタ
  if (locale === "ja") {
    return items.filter((item) => item.category === category).slice(0, count);
  }
  // 原文のカテゴリでフィルタしてから翻訳
  const translations = await getTranslations(locale);
  const filtered = newsItems.filter((item) => item.category === category).slice(0, count);
  return filtered.map((item) => localizeItem(item, translations));
}
