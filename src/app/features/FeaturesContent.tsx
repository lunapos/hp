"use client";

import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { ALL_FEATURES } from "@/lib/constants";
import { Check } from "lucide-react";

export default function FeaturesContent() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
            FEATURES
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            機能紹介
          </h1>
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            LunaPos Floor は、ナイト業界の現場で必要なすべての機能を
            iPadネイティブアプリで提供します。
          </p>
        </div>
      </section>

      {/* Feature Detail Cards */}
      {ALL_FEATURES.map((feature, index) => {
        const Icon = feature.icon;
        const isEven = index % 2 === 0;

        return (
          <Section key={index}>
            <div
              className={`flex flex-col ${
                isEven ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-8`}
            >
              {/* Icon / Visual */}
              <div className="flex-1 flex justify-center">
                <div className="w-48 h-48 rounded-2xl bg-luna-surface border border-luna-border flex items-center justify-center">
                  <Icon className="w-20 h-20 text-luna-gold/60" />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1">
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-luna-gold/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-luna-gold" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-luna-text-secondary leading-relaxed mb-4">
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
              </div>
            </div>
          </Section>
        );
      })}

    </>
  );
}
