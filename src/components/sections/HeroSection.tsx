import Image from "next/image";
import { Tablet, WifiOff, Crown } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,20,48,0.8)_0%,_rgba(10,10,24,1)_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luna-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-luna-gold/3 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-luna-gold/10 border border-luna-gold/30 rounded-full px-4 py-1.5 mb-4 animate-fade-in">
              <span className="text-luna-gold text-sm font-medium tracking-wider">
                Coming Soon - 順次公開予定
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
              ナイト業界のための、
              <br />
              <span className="text-luna-gold drop-shadow-lg">次世代POS</span>システム
            </h1>

            <p className="text-lg text-luna-text-secondary leading-relaxed mb-8 max-w-xl animate-slide-up animation-delay-100 brightness-125">
              フロア管理・会計・出退勤をiPad1台で。
              <br />
              オフライン対応で安心の店舗運営を。
            </p>

            <div className="animate-slide-up animation-delay-200" />
          </div>

          {/* Actual app screenshot */}
          <div className="flex-1 flex justify-center animate-fade-in animation-delay-300">
            <div className="relative w-full max-w-lg">
              <div className="rounded-2xl overflow-hidden border-2 border-luna-border shadow-2xl animate-float">
                <Image
                  src="/screenshots/floor-map.png"
                  alt="LunaPos Floor - フロアマップ画面"
                  width={1024}
                  height={768}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-luna-surface border border-luna-gold/30 rounded-xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-1.5 text-xs">
                  <WifiOff className="w-3.5 h-3.5 text-luna-gold" />
                  <span className="text-luna-gold-light">
                    オフライン対応
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-luna-surface border border-luna-gold/30 rounded-xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-1.5 text-xs">
                  <Tablet className="w-3.5 h-3.5 text-luna-gold" />
                  <span className="text-luna-gold-light">iPad ネイティブ</span>
                </div>
              </div>
              <div className="absolute top-1/2 -right-6 bg-luna-surface border border-luna-gold/30 rounded-xl px-3 py-2 shadow-lg hidden lg:block">
                <div className="flex items-center gap-1.5 text-xs">
                  <Crown className="w-3.5 h-3.5 text-luna-gold" />
                  <span className="text-luna-gold-light">業界特化</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
