"use client";

import { useState } from "react";
import Link from "next/link";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  Landmark,
  Globe,
  Tablet,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface PhaseDetail {
  title: string;
  desc: string;
}

interface Phase {
  phase: string;
  label: string;
  icon: typeof Tablet;
  brandName?: string;
  title: string;
  description: string;
  active: boolean;
  details?: PhaseDetail[];
  href?: string;
}

const phaseIcons = [Tablet, BadgeCheck, Landmark, Globe];
const phaseHrefs = [undefined, "/career", "/fund", "/world"];
const phaseBrandNames = [undefined, "Luna Career", "Luna Fund", "Luna World"];

function PhaseCard({
  item,
  index,
}: {
  item: Phase;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;
  const isLeft = index % 2 === 0;
  const hasDetails = item.details && item.details.length > 0;
  const hasLink = !!item.href;

  const cardContent = (
    <div
      className={`bg-luna-surface border rounded-xl p-6 transition-all duration-300 ${
        item.active
          ? "border-luna-gold shadow-[0_0_30px_rgba(var(--luna-accent-rgb),0.15)]"
          : "border-luna-border"
      } ${hasLink ? "cursor-pointer hover:border-luna-gold/50 hover:shadow-[0_0_20px_rgba(var(--luna-accent-rgb),0.1)]" : ""} ${hasDetails && !hasLink ? "cursor-pointer hover:border-luna-gold/50" : ""}`}
      onClick={hasDetails && !hasLink ? () => setIsOpen(!isOpen) : undefined}
    >
      <div
        className={`flex items-center gap-2 mb-3 ${
          isLeft ? "md:justify-end" : "md:justify-start"
        }`}
      >
        <span
          className={`text-xs tracking-[0.2em] font-bold px-3 py-1 rounded-full ${
            item.active
              ? "bg-luna-gold/20 text-luna-gold"
              : "bg-luna-border/50 text-luna-text-secondary"
          }`}
        >
          {item.phase}
        </span>
        <span className="text-luna-text-secondary text-xs">
          {item.label}
        </span>
        {hasDetails && !hasLink && (
          <ChevronDown
            className={`w-4 h-4 text-luna-text-secondary transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
        {hasLink && (
          <ArrowRight className="w-4 h-4 text-luna-gold ml-auto" />
        )}
      </div>
      {item.brandName && (
        <p className="text-xl font-extrabold tracking-wide mb-1 bg-gradient-to-r from-luna-gold to-amber-300 bg-clip-text text-transparent">
          {item.brandName}
        </p>
      )}
      <h3 className="text-lg font-bold text-luna-text-primary mb-2">
        {item.title}
      </h3>
      <p className="text-luna-text-secondary text-sm leading-relaxed">
        {item.description}
      </p>

      {/* Expandable details (only for cards without link) */}
      {hasDetails && !hasLink && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`border-t border-luna-border pt-4 space-y-3 ${
              isLeft ? "md:text-left" : ""
            }`}
          >
            {item.details!.map((detail, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-luna-gold text-xs mt-0.5 shrink-0">
                  ●
                </span>
                <div>
                  <p className="text-luna-text-primary text-sm font-medium">
                    {detail.title}
                  </p>
                  <p className="text-luna-text-secondary text-xs">
                    {detail.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Content card */}
      <div
        className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
          isLeft ? "md:pr-0 md:text-right" : "md:pl-0 md:text-left"
        }`}
      >
        {hasLink ? (
          <Link href={item.href!} className="block">
            {cardContent}
          </Link>
        ) : (
          cardContent
        )}
      </div>

      {/* Center dot */}
      <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
            item.active
              ? "bg-luna-gold shadow-[0_0_20px_rgba(var(--luna-accent-rgb),0.4)]"
              : "bg-luna-surface border border-luna-border"
          }`}
        >
          <Icon
            className={`w-5 h-5 ${
              item.active ? "text-white" : "text-luna-gold"
            }`}
          />
        </div>
      </div>

      {/* Spacer for the other side */}
      <div className="hidden md:block md:w-[calc(50%-2rem)]" />
    </div>
  );
}

export default function RoadmapSection() {
  const t = useTranslations('roadmap');

  const phases: Phase[] = ([0, 1, 2, 3] as const).map((i) => {
    const phaseData = t.raw(`phases.${i}`) as {
      label: string;
      status: string;
      title: string;
      description: string;
      details?: Record<string, { title: string; description: string }>;
    };

    const details = phaseData.details
      ? Object.values(phaseData.details).map((d) => ({
          title: d.title,
          desc: d.description,
        }))
      : undefined;

    return {
      phase: phaseData.label,
      label: phaseData.status,
      icon: phaseIcons[i],
      brandName: phaseBrandNames[i],
      title: phaseData.title,
      description: phaseData.description,
      active: i === 0,
      details,
      href: phaseHrefs[i],
    };
  });

  return (
    <Section>
      <SectionHeading
        subtitle={t('subtitle')}
        title={t('title')}
        description={t('description')}
      />

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-luna-border md:-translate-x-px" />

        <div className="space-y-12">
          {phases.map((item, index) => (
            <PhaseCard key={index} item={item} index={index} />
          ))}
        </div>

        {/* Arrow at the bottom */}
        <div className="flex justify-center mt-8">
          <div className="w-12 h-12 rounded-full bg-luna-surface border border-luna-border flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-luna-gold rotate-90" />
          </div>
        </div>
      </div>
    </Section>
  );
}
