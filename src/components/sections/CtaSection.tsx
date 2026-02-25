"use client";

import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";

export default function CtaSection() {
  return (
    <Section>
      <div className="relative bg-luna-surface border border-luna-border rounded-2xl p-12 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,184,112,0.08)_0%,_transparent_70%)]" />

        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            まずはお気軽にご相談ください
          </h2>
          <p className="text-luna-text-secondary mb-8 max-w-lg mx-auto">
            累計500会計まで無料でお使いいただけます。
            <br />
            導入のご相談はLINEまたはフォームで受付中です。
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button href="/contact" size="lg">
              LINEで相談する
            </Button>
            <a
              href="/contact"
              className="text-luna-text-secondary text-sm hover:text-white transition-colors"
            >
              メールでのお問い合わせはこちら
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
