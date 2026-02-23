"use client";

import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRICING_PLAN } from "@/lib/constants";
import { Check, Sparkles } from "lucide-react";

export default function PricingSection() {
  return (
    <Section className="bg-luna-surface/50">
      <SectionHeading
        subtitle="PRICING"
        title="料金プラン"
        description="迷わせない、ワンプラン。全機能込みの月額制です。"
      />

      <div className="max-w-lg mx-auto">
        <div className="bg-luna-surface border-2 border-luna-gold rounded-2xl p-8 shadow-[0_0_30px_rgba(212,184,112,0.15)] relative">
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-black text-white">
                {PRICING_PLAN.price}
              </span>
              <span className="text-luna-text-secondary text-lg">
                /月（税込）
              </span>
            </div>
            <p className="text-luna-text-secondary text-sm">
              {PRICING_PLAN.note}
            </p>
          </div>

          <ul className="space-y-4 mb-8">
            {PRICING_PLAN.features.map((feature, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-white"
              >
                <Check className="w-5 h-5 text-luna-gold shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          {/* AI Note */}
          <div className="bg-luna-bg rounded-xl p-4 border border-luna-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-luna-gold" />
              <span className="text-luna-gold text-sm font-medium">
                AI機能について
              </span>
            </div>
            <p className="text-luna-text-secondary text-sm leading-relaxed">
              {PRICING_PLAN.aiNote}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
