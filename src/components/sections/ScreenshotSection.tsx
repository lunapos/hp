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

/** デモを試すまでの手順。messages の demo.steps.* に対応する */
const DEMO_STEPS = ["1", "2", "3"] as const;

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
      <div
        id="demo"
        className="scroll-mt-24 mt-14 rounded-2xl border border-luna-gold/25 bg-luna-surface/60 px-6 py-10 text-center"
      >
        <span className="inline-block rounded-full border border-luna-gold/30 bg-luna-gold/10 px-3 py-1 text-xs font-medium tracking-wider text-luna-gold">
          {tDemo("badge")}
        </span>
        <h3 className="mt-4 text-2xl font-bold text-luna-text-primary">
          {tDemo("heading")}
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-luna-text-secondary">
          {tDemo("desc")}
        </p>
        {/* 「無料で触れる」と言われても手順が分からないと止まるので、
            App Store入手 → トークン入力 → 操作 の3ステップを明示する */}
        <ol className="mx-auto mt-8 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
          {DEMO_STEPS.map((step, i) => (
            <li
              key={step}
              className="rounded-xl border border-luna-border bg-luna-bg/40 p-4"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-luna-gold/15 text-xs font-bold text-luna-gold">
                {i + 1}
              </span>
              <h4 className="mt-2 text-sm font-semibold text-luna-text-primary">
                {tDemo(`steps.${step}.title`)}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-luna-text-secondary">
                {tDemo(`steps.${step}.desc`)}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-7 flex flex-col items-center gap-5">
          <AppStoreButton label={tDemo("button")} location="screenshot" />
          <DemoCredentials label={tDemo("tokenLabel")} />
          <span className="mx-auto max-w-2xl text-xs leading-relaxed text-luna-text-muted">
            {tDemo("note")}
          </span>
        </div>
      </div>
    </Section>
  );
}
