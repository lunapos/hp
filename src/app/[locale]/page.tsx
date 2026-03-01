import HeroSection from "@/components/sections/HeroSection";
import ScreenshotSection from "@/components/sections/ScreenshotSection";
import ProblemSection from "@/components/sections/ProblemSection";
import FeatureHighlights from "@/components/sections/FeatureHighlights";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import FaqSection from "@/components/sections/FaqSection";
import NewsSection from "@/components/sections/NewsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ScreenshotSection />
      <ProblemSection />
      <FeatureHighlights />
      <PricingSection />
      <TestimonialSection />
      <FaqSection />
      <NewsSection />
    </>
  );
}
