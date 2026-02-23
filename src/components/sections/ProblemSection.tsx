"use client";

import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { PAIN_POINTS } from "@/lib/constants";

export default function ProblemSection() {
  return (
    <Section className="bg-luna-surface/50">
      <SectionHeading
        subtitle="PROBLEMS"
        title="こんなお悩みはありませんか？"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {PAIN_POINTS.map((point, index) => {
          const Icon = point.icon;
          return (
            <Card key={index} hover className={`animation-delay-${(index + 1) * 100}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-luna-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-luna-gold" />
                </div>
                <p className="text-luna-text-secondary leading-relaxed text-sm">
                  {point.text}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xl font-bold text-white">
        <span className="text-luna-gold">LunaPos</span> がすべて解決します。
      </p>
    </Section>
  );
}
