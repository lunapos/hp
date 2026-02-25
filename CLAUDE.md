# LunaPos HP (Next.js)

## Standing Instructions

- **Auto-push**: 改良の度に `git push` すること
- **開発アップデート**: push の度に `src/data/news.ts` に開発アップデートエントリを追加すること（HP/LP/App すべて）
- **App 更新の反映**: LunaPos App（Floor/Cast/Admin）の開発アップデートも HP の news.ts に反映すること
- **LP 更新の反映**: LP の変更も HP の news.ts に開発アップデートとして追加すること

## Project Structure

- **HP**: Next.js App Router (`src/app/`), Tailwind CSS v4, deployed to lunapos.jp
- **LP**: Vite + React SPA (`/Users/ryuichiueda/works/luna/lp`), deployed to lp.lunapos.jp
- **App**: Swift/SwiftUI native iPad/iPhone apps (`/Users/ryuichiueda/works/luna/lunapos-floor`, `lunapos-cast`, `lunapos-admin`)

## Key Files

- `src/data/news.ts` — News & development update entries (sorted by date descending)
- `src/lib/constants.ts` — Pricing, features, nav items
- `src/app/globals.css` — Theme CSS variables (dark/light mode)
- `src/components/layout/Header.tsx` — Site header with theme toggle
