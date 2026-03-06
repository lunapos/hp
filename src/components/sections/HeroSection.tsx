import Image from "next/image";
import { Tablet, WifiOff, Crown } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,20,48,0.8)_0%,_rgba(10,10,24,1)_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luna-gold/5 rounded-full blur-3xl will-change-transform" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-luna-gold/3 rounded-full blur-3xl will-change-transform" />

      <div className="relative max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-luna-gold/10 border border-luna-gold/30 rounded-full px-4 py-1.5 mb-4 animate-fade-in">
              <span className="text-luna-gold text-sm font-medium tracking-wider">
                {t("badge")}
              </span>
            </div>
            <br />
            <div className="inline-flex items-center gap-2 bg-luna-surface border border-luna-border rounded-full px-4 py-1.5 mb-6 animate-fade-in">
              <span className="text-luna-gold text-sm">&#9789;</span>
              <span className="text-luna-gold text-sm tracking-[0.2em]">
                LunaPos Floor
              </span>
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-slide-up"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
            >
              {t("title1")}
              <br />
              <span className="text-luna-gold drop-shadow-lg">{t("title2")}</span>{t("title3")}
            </h1>

            <p className="text-lg text-luna-text-secondary leading-relaxed mb-8 max-w-xl animate-slide-up animation-delay-100 brightness-125">
              {t("description1")}
              <br />
              {t("description2")}
            </p>

            <div className="animate-slide-up animation-delay-200" />
          </div>

          {/* Actual app screenshot */}
          <div className="flex-1 flex justify-center animate-fade-in animation-delay-300">
            <div className="relative w-full max-w-lg">
              <div className="rounded-2xl overflow-hidden border-2 border-luna-border shadow-2xl animate-float">
                <Image
                  src="/screenshots/floor-map.webp"
                  alt={t("imageAlt")}
                  width={1024}
                  height={768}
                  quality={80}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 512px"
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-luna-surface border border-luna-gold/30 rounded-xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-1.5 text-xs">
                  <WifiOff className="w-3.5 h-3.5 text-luna-gold" />
                  <span className="text-luna-gold-light">
                    {t("floatingOffline")}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-luna-surface border border-luna-gold/30 rounded-xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-1.5 text-xs">
                  <Tablet className="w-3.5 h-3.5 text-luna-gold" />
                  <span className="text-luna-gold-light">{t("floatingNative")}</span>
                </div>
              </div>
              <div className="absolute top-1/2 -right-6 bg-luna-surface border border-luna-gold/30 rounded-xl px-3 py-2 shadow-lg hidden lg:block">
                <div className="flex items-center gap-1.5 text-xs">
                  <Crown className="w-3.5 h-3.5 text-luna-gold" />
                  <span className="text-luna-gold-light">{t("floatingSpecialized")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
