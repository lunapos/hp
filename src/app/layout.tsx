import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { getLocale } from "next-intl/server";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-5DHKDT51M1";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lunapos.jp"),
  title: {
    default: "LunaPos | ナイトエンタメ業界向けPOSシステム",
    template: "%s | LunaPos",
  },
  description:
    "キャバクラ・ガールズバー・スナック・ホスト向けの次世代POSシステム。フロア管理・会計・出退勤をiPad1台で。オフライン対応で安心の店舗運営。",
  alternates: {
    canonical: "https://lunapos.jp",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://lunapos.jp",
    siteName: "LunaPos",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('luna-theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </head>
      <body className={`${notoSansJP.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
