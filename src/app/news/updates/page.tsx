import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import PaginatedNewsList from "@/components/ui/PaginatedNewsList";
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
      <PaginatedNewsList items={items} />
    </Section>
  );
}
