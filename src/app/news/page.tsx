import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import NewsTabs from "@/components/ui/NewsTabs";
import { newsItems } from "@/data/news";

export const metadata: Metadata = {
  title: "お知らせ・開発アップデート",
  description:
    "LunaPosの最新情報、開発アップデート、メンテナンス情報をお届けします。",
};

export default function NewsListPage() {
  return (
    <Section className="pt-32">
      <SectionHeading
        subtitle="NEWS"
        title="お知らせ・開発アップデート"
      />
      <NewsTabs items={newsItems} />
    </Section>
  );
}
