import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import PaginatedNewsList from "@/components/ui/PaginatedNewsList";
import { newsItems } from "@/data/news";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "LunaPosからのお知らせ一覧です。",
};

export default function AnnouncementsPage() {
  const items = newsItems.filter(
    (item) =>
      item.category === "お知らせ" ||
      item.category === "キャンペーン" ||
      item.category === "メンテナンス"
  );

  return (
    <Section className="pt-32">
      <SectionHeading subtitle="ANNOUNCEMENTS" title="お知らせ" />
      <PaginatedNewsList items={items} />
    </Section>
  );
}
