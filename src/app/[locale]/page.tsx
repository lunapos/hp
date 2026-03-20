import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import HeroSection from "@/components/sections/HeroSection";
import ScreenshotSection from "@/components/sections/ScreenshotSection";
import NewsSection from "@/components/sections/NewsSection";
import ColumnSection from "@/components/sections/ColumnSection";
import { WebSiteJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { FAQ_COUNT } from "@/lib/constants";

const ProblemSection = dynamic(() => import("@/components/sections/ProblemSection"));
const FeatureHighlights = dynamic(() => import("@/components/sections/FeatureHighlights"));
const PricingSection = dynamic(() => import("@/components/sections/PricingSection"));
const TestimonialSection = dynamic(() => import("@/components/sections/TestimonialSection"));
const FaqSection = dynamic(() => import("@/components/sections/FaqSection"));

export default async function HomePage() {
  const t = await getTranslations("faq");
  const faqItems = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <>
      <WebSiteJsonLd />
      <FaqJsonLd items={faqItems} />
      <HeroSection />
      <ScreenshotSection />
      <ProblemSection />
      <FeatureHighlights />
      <PricingSection />
      <TestimonialSection />
      <FaqSection />
      <ColumnSection />
      <NewsSection />
    </>
  );
}
