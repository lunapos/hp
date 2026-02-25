import Link from "next/link";
import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { newsItems } from "@/data/news";

export const metadata: Metadata = {
  title: "開発アップデート",
  description:
    "LunaPosの開発アップデート・リリースノート一覧です。",
};

export default function UpdatesPage() {
  const items = newsItems.filter(
    (item) => item.category === "開発アップデート"
  );

  return (
    <Section className="pt-32">
      <SectionHeading subtitle="UPDATES" title="開発アップデート" />

      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${item.slug}`}
            className="block bg-luna-surface border border-luna-border rounded-xl p-6 hover:border-luna-gold transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <time className="text-luna-text-muted text-sm tabular-nums shrink-0">
                {item.date}
              </time>
              <h2 className="text-luna-text-primary font-medium text-lg group-hover:text-luna-gold transition-colors duration-200">
                {item.title}
              </h2>
            </div>
            <p className="text-luna-text-secondary text-sm leading-relaxed">
              {item.summary}
            </p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
