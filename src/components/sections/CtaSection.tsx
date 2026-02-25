"use client";

import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";

export default function CtaSection() {
  return (
    <Section>
      <div className="relative bg-luna-surface border border-luna-border rounded-2xl p-12 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(var(--luna-accent-rgb),0.08)_0%,_transparent_70%)]" />

        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold text-luna-text-primary mb-4">
            まずはお気軽にご相談ください
          </h2>
          <p className="text-luna-text-secondary mb-8 max-w-lg mx-auto">
            現在開発中です。事前登録いただくと、リリース時に優先的にご案内いたします。
            <br />
            ご質問・ご相談はLINEまたはフォームで受付中です。
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button href="/contact" size="lg">
              事前登録・お問い合わせ
            </Button>
            <a
              href="/contact"
              className="text-luna-text-secondary text-sm hover:text-luna-text-primary transition-colors"
            >
              メールでのお問い合わせはこちら
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
