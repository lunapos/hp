import Image from "next/image";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";

const screenshots = [
  {
    src: "/screenshots/floor-map.png",
    alt: "LunaPos Floor - フロアマップ画面",
    caption: "フロアマップ",
    description: "テーブルの状態・残り時間・売上をリアルタイムに一覧表示",
  },
  {
    src: "/screenshots/cast-management.png",
    alt: "LunaPos Floor - キャスト管理画面",
    caption: "キャスト管理",
    description: "出退勤状況・勤務時間をフォトグリッドで直感的に把握",
  },
];

export default function ScreenshotSection() {
  return (
    <Section>
      <SectionHeading
        subtitle="PREVIEW"
        title="開発中の画面"
        description="現在開発中のLunaPos Floorアプリの実際の画面です"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {screenshots.map((shot) => (
          <div key={shot.src} className="group">
            <div className="relative overflow-hidden rounded-2xl border border-luna-border bg-luna-surface shadow-lg">
              <Image
                src={shot.src}
                alt={shot.alt}
                width={1024}
                height={768}
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-luna-text-primary font-semibold text-lg">
                {shot.caption}
              </h3>
              <p className="text-luna-text-secondary text-sm mt-1">
                {shot.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
