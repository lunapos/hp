"use client";

import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRICING_FREE, PRICING_PRO } from "@/lib/constants";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function PricingSection() {
  return (
    <Section className="bg-luna-surface/50">
      <SectionHeading
        subtitle="PRICING"
        title="料金プラン"
        description="最初の500会計は無料。そのあと月額¥30,000。"
      />

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="bg-luna-surface border border-luna-border rounded-2xl p-8">
          <div className="text-center mb-6">
            <p className="text-luna-text-secondary text-sm font-medium mb-2">
              {PRICING_FREE.name}
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-black text-white">
                {PRICING_FREE.price}
              </span>
            </div>
            <p className="text-luna-text-secondary text-sm">
              {PRICING_FREE.description}
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {PRICING_FREE.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-white">
                <Check className="w-5 h-5 text-luna-gold shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="bg-luna-surface border-2 border-luna-gold rounded-2xl p-8 shadow-[0_0_30px_rgba(212,184,112,0.15)] relative">
          <div className="text-center mb-6">
            <p className="text-luna-gold text-sm font-medium mb-2">
              {PRICING_PRO.name}
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-black text-white">
                {PRICING_PRO.price}
              </span>
              <span className="text-luna-text-secondary text-lg">/月（税込）</span>
            </div>
            <p className="text-luna-text-secondary text-sm">
              {PRICING_PRO.description}
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {PRICING_PRO.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-white">
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
              {PRICING_PRO.aiNote}
            </p>
          </div>
        </div>
      </div>

      {/* Flow description */}
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <div className="inline-flex items-center gap-3 text-luna-text-secondary text-sm">
          <span className="bg-luna-surface border border-luna-border rounded-lg px-3 py-1.5">導入（¥0）</span>
          <ArrowRight className="w-4 h-4" />
          <span className="bg-luna-surface border border-luna-border rounded-lg px-3 py-1.5">500会計まで無料で利用</span>
          <ArrowRight className="w-4 h-4" />
          <span className="bg-luna-surface border border-luna-gold/50 rounded-lg px-3 py-1.5 text-luna-gold">501会計目からPro（月額¥30,000）</span>
        </div>
      </div>
    </Section>
  );
}
