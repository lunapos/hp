// JSON-LD 構造化データコンポーネント

const BASE_URL = "https://lunapos.jp";

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LunaPos",
    url: BASE_URL,
    description:
      "キャバクラ・ガールズバー・スナック・ホスト向けの次世代POSシステム。フロア管理・会計・出退勤をiPad1台で。",
    publisher: {
      "@type": "Organization",
      name: "zh（Zero Human）",
      url: BASE_URL,
    },
    inLanguage: ["ja", "en", "zh"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ArticleJsonLdProps {
  title: string;
  description: string;
  date: string;
  lastModified?: string;
  slug: string;
  tags?: string[];
}

export function ArticleJsonLd({
  title,
  description,
  date,
  lastModified,
  slug,
  tags,
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: date,
    dateModified: lastModified || date,
    url: `${BASE_URL}/column/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/column/${slug}`,
    },
    author: {
      "@type": "Organization",
      name: "LunaPos",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "LunaPos",
      url: BASE_URL,
    },
    ...(tags && tags.length > 0 ? { keywords: tags.join(", ") } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  title: string;
  slug: string;
}

export function BreadcrumbJsonLd({ title, slug }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "トップ",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "コラム",
        item: `${BASE_URL}/column`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${BASE_URL}/column/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
