import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";

const SCREENSHOT_SRCS = [
  "/screenshots/floor-map.webp",
  "/screenshots/cast-management.webp",
];

export default async function ScreenshotSection() {
  const t = await getTranslations("screenshot");

  return (
    <Section>
      <SectionHeading
        subtitle={t("subtitle")}
        title={t("title")}
        description={t("description")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SCREENSHOT_SRCS.map((src, i) => (
          <div key={src} className="group">
            <div className="relative overflow-hidden rounded-2xl border border-luna-border bg-luna-surface shadow-lg">
              <Image
                src={src}
                alt={t(`items.${i}.alt`)}
                width={1024}
                height={768}
                quality={80}
                sizes="(max-width: 768px) 100vw, 512px"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-luna-text-primary font-semibold text-lg">
                {t(`items.${i}.caption`)}
              </h3>
              <p className="text-luna-text-secondary text-sm mt-1">
                {t(`items.${i}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
