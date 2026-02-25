"use client";

import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FEATURE_HIGHLIGHTS } from "@/lib/constants";
import { Check } from "lucide-react";

export default function FeatureHighlights() {
  return (
    <Section>
      <SectionHeading
        subtitle="FEATURES"
        title="LunaPos の特徴"
        description="ナイト業界の現場を知り尽くした、専用POSシステムです。"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {FEATURE_HIGHLIGHTS.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} hover className={`animation-delay-${(index + 1) * 100}`}>
              <div className="w-12 h-12 rounded-xl bg-luna-gold/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-luna-gold" />
              </div>
              <h3 className="text-lg font-bold text-luna-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-luna-text-secondary text-sm leading-relaxed mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.details.map((detail, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-luna-text-secondary"
                  >
                    <Check className="w-4 h-4 text-luna-gold shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button href="/features" variant="secondary">
          すべての機能を見る
        </Button>
      </div>
    </Section>
  );
}
