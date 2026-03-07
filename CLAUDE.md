# LunaPos HP（Next.js）→ lunapos.jp

> 共通ルール・ブランドカラーは親 `../CLAUDE.md` を参照。

## 運用ルール

- **Auto-push**: 改良の度に `git push` すること
- **開発ニュース（自動更新必須）**: 全プロジェクト（Floor/Admin/Cast/HP/LP/記事）で機能追加・変更を push するたびに `src/data/news-updates.ts` に開発アップデートを追加して push する。別途指示がなくても自動で行うこと
- **お知らせ**: 重要なアナウンスは `src/data/news-announcements.ts` に追加する

## 技術スタック

- Next.js App Router (`src/app/`)
- Tailwind CSS v4
- デプロイ先: lunapos.jp

## 主要ファイル

| ファイル | 用途 |
|---------|------|
| `src/data/news-updates.ts` | 開発アップデート（pushのたびに追加） |
| `src/data/news-announcements.ts` | お知らせ |
| `src/data/news.ts` | 上記2ファイルを集約するアグリゲーター |
| `src/lib/constants.ts` | 料金・機能・ナビ定義 |
| `src/app/globals.css` | テーマ CSS 変数 |
| `src/components/layout/Header.tsx` | ヘッダー・テーマ切替 |
