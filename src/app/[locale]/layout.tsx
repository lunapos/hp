import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingLineButton from "@/components/ui/FloatingLineButton";
import { routing } from "@/i18n/routing";

const baseUrl = "https://lunapos.jp";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical =
    locale === routing.defaultLocale
      ? baseUrl
      : `${baseUrl}/${locale}`;

  return {
    alternates: {
      canonical,
      languages: {
        ja: baseUrl,
        en: `${baseUrl}/en`,
        zh: `${baseUrl}/zh`,
        "x-default": baseUrl,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header />
      <main className="pt-16">{children}</main>
      <Footer />
      <FloatingLineButton />
    </NextIntlClientProvider>
  );
}
