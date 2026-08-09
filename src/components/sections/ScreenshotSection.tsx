import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import AppStoreButton from "@/components/ui/AppStoreButton";
import DemoCredentials from "@/components/ui/DemoCredentials";

const SCREENSHOT_SRCS = [
  "/screenshots/floor-map.webp",
  "/screenshots/cast-management.webp",
];

export default async function ScreenshotSection() {
  const t = await getTranslations("screenshot");
  const tDemo = await getTranslations("demo");

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

      {/* スクリーンショットを見た直後が一番「触ってみたい」タイミングなので、
          ここにApp Store導線とデモ用トークンを置く */}
      <div className="mt-14 rounded-2xl border border-luna-gold/25 bg-luna-surface/60 px-6 py-10 text-center">
        <span className="inline-block rounded-full border border-luna-gold/30 bg-luna-gold/10 px-3 py-1 text-xs font-medium tracking-wider text-luna-gold">
          {tDemo("badge")}
        </span>
        <h3 className="mt-4 text-2xl font-bold text-luna-text-primary">
          {tDemo("heading")}
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-luna-text-secondary">
          {tDemo("desc")}
        </p>
        <div className="mt-7 flex flex-col items-center gap-5">
          <AppStoreButton label={tDemo("button")} location="screenshot" />
          <DemoCredentials label={tDemo("tokenLabel")} />
          <span className="text-xs text-luna-text-muted">{tDemo("note")}</span>
        </div>
      </div>
    </Section>
  );
}
