import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      // /media → /column リネーム対応（2026-02-26）
      {
        source: "/media/:slug*",
        destination: "/column/:slug*",
        permanent: true,
      },
      // 記事URLの変更対応
      {
        source: "/column/opening-cabaret-in-japan",
        destination: "/column/cabaret-opening-steps",
        permanent: true,
      },
      // /pricing は独立ページなし → トップページの料金セクションへ
      {
        source: "/pricing",
        destination: "/#pricing",
        permanent: true,
      },
      // 旧ニュースURL → 正しいパスへリダイレクト
      {
        source: "/:locale(en|zh)/news/column-:slug",
        destination: "/:locale/column/:slug",
        permanent: true,
      },
      {
        source: "/news/column-:slug",
        destination: "/column/:slug",
        permanent: true,
      },
      // 削除済みニュースアイテム
      {
        source: "/news/hp-nav-split-media-rename",
        destination: "/news",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
