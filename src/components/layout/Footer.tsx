import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { NAV_ITEMS, FOOTER_NAV_ITEMS, BRAND } from "@/lib/constants";

const LOCALE_LABELS: Record<string, string> = {
  ja: "日本語",
  en: "English",
  zh: "中文",
};

export default async function Footer() {
  const tNav = await getTranslations("nav");
  const tFooter = await getTranslations("footer");
  const currentLocale = await getLocale();

  return (
    <footer className="bg-luna-bg border-t border-luna-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold mb-4">
              <Image src="/icon.png" alt="LunaPos" width={24} height={24} />
              <span className="text-luna-gold tracking-wider">
                {BRAND.name}
              </span>
            </div>
            <p className="text-luna-text-secondary text-sm leading-relaxed">
              {tFooter("tagline1")}
              <br />
              {tFooter("tagline2")}
            </p>
          </div>

          <div>
            <h3 className="text-luna-text-primary font-semibold mb-4">{tFooter("sitemap")}</h3>
            <ul className="flex flex-col gap-2">
              {[...NAV_ITEMS, ...FOOTER_NAV_ITEMS].map(
                (item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-luna-text-secondary text-sm hover:text-luna-text-primary transition-colors duration-200"
                    >
                      {tNav(item.key)}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-luna-text-primary font-semibold mb-4">{tFooter("industries")}</h3>
            <ul className="flex flex-col gap-2">
              {[
                { key: "cabaret", path: "/cabaret" },
                { key: "girlsBar", path: "/girls-bar" },
                { key: "lounge", path: "/lounge" },
                { key: "snack", path: "/snack" },
                { key: "host", path: "/host" },
              ].map((item) => (
                <li key={item.path}>
                  <a
                    href={`https://lp.lunapos.jp${item.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-luna-text-secondary text-sm hover:text-luna-text-primary transition-colors duration-200"
                  >
                    {tFooter(`industry.${item.key}`)}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="text-luna-text-primary font-semibold mb-4">{tFooter("contactTitle")}</h3>
              <p className="text-luna-text-secondary text-sm">{BRAND.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-luna-border">
          <p className="text-xs text-luna-text-muted mb-2">zh グループ</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {[
              { name: "Wattly", url: "https://wattly.jp" },
              { name: "Casinohub", url: "https://casinohub.jp" },
              { name: "Roomly", url: "https://hp.roomly.jp" },
            ].map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-luna-text-muted hover:text-luna-text-secondary transition-colors duration-200"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-luna-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-luna-text-muted text-sm">
              &copy; 2026 {BRAND.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[
                { key: "terms", href: "/legal/terms" },
                { key: "privacy", href: "/legal/privacy" },
                { key: "tokushoho", href: "/legal/tokushoho" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-luna-text-muted text-xs hover:text-luna-text-secondary transition-colors duration-200"
                >
                  {tFooter(item.key)}
                </Link>
              ))}
              <span className="text-luna-border">|</span>
              {(["ja", "en", "zh"] as const).map((locale) => (
                <Link
                  key={locale}
                  href="/"
                  locale={locale}
                  className={`text-xs transition-colors duration-200 ${
                    locale === currentLocale
                      ? "text-luna-gold"
                      : "text-luna-text-muted hover:text-luna-text-secondary"
                  }`}
                >
                  {LOCALE_LABELS[locale]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
