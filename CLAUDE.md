# Luna — プロジェクト横断ルール

## プロジェクト構成

```
luna/
├── lunapos-floor/    ← POS フロア画面（Swift + SwiftUI, iPad）
├── lunapos-cast/     ← キャスト向け画面（Vite + React + TS）
├── lunapos-admin/    ← オーナー管理画面（Vite + React + TS）
├── hp/               ← ホームページ（Next.js）
├── lp/               ← ランディングページ（Vite）
├── supabase/         ← 共有バックエンド（DB / Auth / Realtime）
├── marketing/article/ ← オウンドメディア記事
├── SNS運用/          ← SNS運用ガイド
├── 事業運営/          ← 事業運営タスク管理
├── 規約/             ← 法務文書
├── images/           ← ロゴ・素材
└── partner/          ← パートナープログラム
```

## 共有バックエンド（Supabase）

全アプリが同一のSupabase DBを参照する。スキーマは `supabase/migrations/` で管理。

### 主要テーブル一覧

| テーブル | 用途 | Floor | Admin | Cast |
|---------|------|:-----:|:-----:|:----:|
| stores | 店舗設定（税率・料率） | R | RW | R |
| rooms | ルーム設定 | R | RW | — |
| floor_tables | テーブル | RW | RW | R |
| casts | キャスト基本情報 | R | RW | R |
| cast_shifts | 出退勤記録 | RW | R | R |
| customers | 顧客情報 | R | RW | R |
| menu_items | メニュー | R | RW | — |
| set_plans | セット料金プラン | R | RW | — |
| visits | 来店 | RW | R | R |
| nominations | 指名 | RW | R | R |
| order_items | 注文明細 | RW | R | — |
| payments | 会計 | RW | R | — |
| payment_items | 会計明細スナップ | RW | R | — |
| cash_withdrawals | 出金記録 | RW | R | — |
| register_sessions | レジ開始金額 | RW | R | — |
| bottles | ボトルキープ | R | RW | R |
| devices | iPad端末認証 | R | RW | — |

### 料金マスター（stores テーブル）

| 項目 | カラム | デフォルト |
|------|--------|-----------|
| サービス料率 | service_rate | 40% |
| 消費税率 | tax_rate | 10% |
| 同伴料 | douhan_fee | ¥3,000 |
| 本指名料 | nomination_fee_main | ¥5,000 |
| 場内指名料 | nomination_fee_in_store | ¥2,000 |

### RLS（Row Level Security）

全テーブルに `tenant_id` カラムがあり、JWT内の `tenant_id` クレームでフィルタする。
`public.tenant_id()` 関数でJWTからテナントIDを取得。

## 共通ルール

- **言語**: 日本語で作業・出力（コード内コメントも日本語可）
- **金額**: 全て税込で記載
- **日付**: YYYY-MM-DD 形式
- **コミットメッセージ**: 日本語、簡潔に
- **秘密情報**: `.env`, credentials, API keyは絶対にコミットしない
- **DB変更**: 必ず `supabase/migrations/` にマイグレーションファイルを作成。直接DB操作しない

## ブランドカラー

| 名前 | ダーク | 用途 |
|------|--------|------|
| lunaDark | #1a1040 | ヘッダー・ナビ背景 |
| lunaGold | #d4b870 | アクセント・ロゴ |
| lunaGoldDark | #c9a456 | 金額・強調テキスト |

## 事業情報

- βリリース: 2026-03-29（新宿アップス）
- 正式リリース: 2026-04-30
- 月額: フリーミアム（月500会計まで無料）/ ¥30,000
