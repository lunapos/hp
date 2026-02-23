import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingLineButton from "@/components/ui/FloatingLineButton";

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
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://lunapos.jp",
    siteName: "LunaPos",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <FloatingLineButton />
      </body>
    </html>
  );
}
