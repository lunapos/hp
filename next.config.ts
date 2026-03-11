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
    ];
  },
};

export default withNextIntl(nextConfig);
