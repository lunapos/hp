"use client";

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

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-slide-up">
              ナイト業界のための、
              <br />
              <span className="text-luna-gold">次世代POS</span>システム
            </h1>

            <p className="text-lg text-luna-text-secondary leading-relaxed mb-8 max-w-xl animate-slide-up animation-delay-100">
              フロア管理・会計・出退勤をiPad1台で。
              <br />
              オフライン対応で安心の店舗運営を。
            </p>

            <div className="animate-slide-up animation-delay-200" />
          </div>

          {/* iPad mockup area */}
          <div className="flex-1 flex justify-center animate-fade-in animation-delay-300">
            <div className="relative w-full max-w-md">
              <div className="bg-luna-surface border-2 border-luna-border rounded-3xl p-6 shadow-2xl animate-float">
                <div className="bg-luna-bg rounded-2xl p-6 space-y-4">
                  {/* Mockup: Floor map */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-luna-gold text-lg">&#9789;</span>
                      <span className="text-white text-sm font-bold tracking-wider">
                        FLOOR MAP
                      </span>
                    </div>
                    <span className="text-luna-gold text-xs">
                      本日売上: ¥385,000
                    </span>
                  </div>

                  {/* Table grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: "T1", status: "occupied" },
                      { name: "T2", status: "empty" },
                      { name: "T3", status: "waiting" },
                      { name: "T4", status: "occupied" },
                      { name: "T5", status: "occupied" },
                      { name: "T6", status: "empty" },
                      { name: "T7", status: "empty" },
                      { name: "T8", status: "occupied" },
                    ].map((table) => (
                      <div
                        key={table.name}
                        className={`rounded-lg p-2 text-center text-xs font-medium ${
                          table.status === "occupied"
                            ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800"
                            : table.status === "waiting"
                            ? "bg-amber-900/40 text-amber-400 border border-amber-800"
                            : "bg-luna-surface text-luna-text-secondary border border-luna-border"
                        }`}
                      >
                        <div>{table.name}</div>
                        <div className="text-[10px] mt-0.5 opacity-70">
                          {table.status === "occupied"
                            ? "1:30"
                            : table.status === "waiting"
                            ? "会計待"
                            : "空席"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom stats */}
                  <div className="flex justify-between text-[10px] text-luna-text-secondary pt-2 border-t border-luna-border">
                    <span>使用中: 4</span>
                    <span>空席: 3</span>
                    <span>会計待: 1</span>
                  </div>
                </div>
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
