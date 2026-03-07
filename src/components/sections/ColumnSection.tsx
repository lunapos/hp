import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getAllArticles } from "@/lib/media";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import ContentCard from "@/components/ui/ContentCard";

const MAX_ARTICLES = 3;

export default async function ColumnSection() {
  const locale = await getLocale();
  const articles = getAllArticles(locale);

  // 記事がない場合はセクションを表示しない
  if (articles.length === 0) return null;

  const latestArticles = articles.slice(0, MAX_ARTICLES);
  const t = await getTranslations("columnSection");

  return (
    <Section>
      <SectionHeading subtitle={t("subtitle")} title={t("title")} />

      <div className="space-y-4 mb-8">
        {latestArticles.map((article) => (
          <ContentCard
            key={article.slug}
            href={`/column/${article.slug}`}
            date={article.date}
            title={article.title}
            description={article.description}
            category={article.category}
            tags={article.tags}
          />
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/column"
          className="inline-flex items-center gap-2 text-luna-gold hover:text-luna-gold-light transition-colors duration-200 font-medium"
        >
          <BookOpen className="w-4 h-4" />
          {t("viewAll")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}
