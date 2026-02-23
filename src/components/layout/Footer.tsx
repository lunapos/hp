import Link from "next/link";
import { NAV_ITEMS, BRAND } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-luna-bg border-t border-luna-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold mb-4">
              <span className="text-2xl text-luna-gold">&#9789;</span>
              <span className="text-luna-gold tracking-wider">
                {BRAND.name}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              ナイト業界に特化したPOSシステム。
              <br />
              売上管理・顧客管理をスマートに。
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">サイトマップ</h3>
            <ul className="flex flex-col gap-2">
              {NAV_ITEMS.map(
                (item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 text-sm hover:text-white transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}

            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">業種別ページ</h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: "キャバクラ向け", path: "/cabaret" },
                { label: "ガールズバー向け", path: "/girls-bar" },
                { label: "ラウンジ向け", path: "/lounge" },
                { label: "スナック向け", path: "/snack" },
                { label: "ホスト向け", path: "/host" },
              ].map((item) => (
                <li key={item.path}>
                  <a
                    href={`https://lp.lunapos.jp${item.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 text-sm hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-4">お問い合わせ</h3>
              <p className="text-gray-400 text-sm">{BRAND.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-luna-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; 2026 {BRAND.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: "利用規約", href: "/legal/terms" },
                { label: "プライバシーポリシー", href: "/legal/privacy" },
                { label: "特定商取引法", href: "/legal/tokushoho" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-500 text-xs hover:text-gray-300 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
