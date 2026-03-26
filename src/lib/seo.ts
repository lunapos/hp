// 多言語SEOヘルパー
const baseUrl = "https://lunapos.jp";

/** locale に応じた完全URLを生成（ja はプレフィックスなし） */
export function localizedUrl(path: string, locale: string): string {
  return locale === "ja"
    ? `${baseUrl}${path}`
    : `${baseUrl}/${locale}${path}`;
}

/** canonical + hreflang alternates を生成 */
export function localizedAlternates(path: string, locale: string) {
  return {
    canonical: localizedUrl(path, locale),
    languages: {
      ja: `${baseUrl}${path}`,
      en: `${baseUrl}/en${path}`,
      zh: `${baseUrl}/zh${path}`,
      "x-default": `${baseUrl}${path}`,
    },
  };
}
