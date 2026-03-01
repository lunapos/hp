"use client";

import { useTranslations } from "next-intl";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import {
  User,
  Store,
  Building2,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BenefitGroup {
  icon: LucideIcon;
  key: "cast" | "sender" | "receiver";
  color: string;
  bgColor: string;
  borderColor: string;
  itemCount: number;
}

const BENEFIT_GROUPS: BenefitGroup[] = [
  {
    icon: User,
    key: "cast",
    color: "text-luna-gold",
    bgColor: "bg-luna-gold/10",
    borderColor: "border-luna-gold/30",
    itemCount: 4,
  },
  {
    icon: Store,
    key: "sender",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    itemCount: 3,
  },
  {
    icon: Building2,
    key: "receiver",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    itemCount: 3,
  },
];

export default function ThreeWayBenefitSection() {
  const t = useTranslations("threeWay");

  return (
    <Section>
      <SectionHeading
        subtitle={t("subtitle")}
        title={t("title")}
        description={t("description")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BENEFIT_GROUPS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Card key={index} hover>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-10 h-10 rounded-lg ${benefit.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${benefit.color}`} />
                </div>
                <h3 className={`text-lg font-bold ${benefit.color}`}>
                  {t(`${benefit.key}.label`)}
                </h3>
              </div>

              <ul className="space-y-4">
                {Array.from({ length: benefit.itemCount }, (_, i) => i).map((i) => (
                  <li key={i} className="flex gap-3">
                    <Check
                      className={`w-4 h-4 ${benefit.color} shrink-0 mt-0.5`}
                    />
                    <div>
                      <p className="text-luna-text-primary text-sm font-medium">
                        {t(`${benefit.key}.items.${i}.title`)}
                      </p>
                      <p className="text-luna-text-secondary text-xs mt-0.5">
                        {t(`${benefit.key}.items.${i}.description`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
