import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";
import ScreenshotSection from "@/components/sections/ScreenshotSection";
import NewsSection from "@/components/sections/NewsSection";
import ColumnSection from "@/components/sections/ColumnSection";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";

const ProblemSection = dynamic(() => import("@/components/sections/ProblemSection"));
const FeatureHighlights = dynamic(() => import("@/components/sections/FeatureHighlights"));
const PricingSection = dynamic(() => import("@/components/sections/PricingSection"));
const TestimonialSection = dynamic(() => import("@/components/sections/TestimonialSection"));
const FaqSection = dynamic(() => import("@/components/sections/FaqSection"));

export default function HomePage() {
  return (
    <>
      <WebSiteJsonLd />
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
