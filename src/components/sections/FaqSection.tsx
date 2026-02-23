"use client";

import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import { FAQS } from "@/lib/constants";

export default function FaqSection() {
  return (
    <Section className="bg-luna-surface/50">
      <SectionHeading subtitle="FAQ" title="よくあるご質問" />
      <div className="max-w-3xl mx-auto">
        <Accordion items={FAQS} />
      </div>
    </Section>
  );
}
