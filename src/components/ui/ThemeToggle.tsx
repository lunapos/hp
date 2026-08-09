"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";

// テーマの実体は <html> の light クラス（layout.tsx のインラインスクリプトが
// ハイドレーション前に付与する）。それを唯一の情報源として購読する。
// useEffect + setState で読むとハイドレーション後に再レンダリングが走るため使わない。
const themeStore = {
  subscribe(onChange: () => void) {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  },
  getSnapshot() {
    return document.documentElement.classList.contains("light");
  },
  // サーバー側ではダーク（デフォルト）として描画する
  getServerSnapshot() {
    return false;
  },
};

export default function ThemeToggle() {
  const isLight = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  );
  const t = useTranslations("common");

  const toggle = () => {
    const next = !isLight;
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("luna-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("luna-theme", "dark");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer"
      style={{
        backgroundColor: isLight
          ? "rgba(var(--luna-accent-rgb), 0.2)"
          : "var(--luna-border)",
      }}
      aria-label={isLight ? t("darkMode") : t("lightMode")}
    >
      <span
        className="absolute left-1 flex items-center justify-center w-5 h-5 rounded-full shadow-sm transition-transform duration-300"
        style={{
          transform: isLight ? "translateX(28px)" : "translateX(0)",
          backgroundColor: isLight ? "var(--luna-gold)" : "var(--luna-text-secondary)",
        }}
      >
        {isLight ? (
          <Sun className="w-3 h-3 text-white" />
        ) : (
          <Moon className="w-3 h-3 text-luna-bg" />
        )}
      </span>
    </button>
  );
}
