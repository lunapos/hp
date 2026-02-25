"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
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
      className="relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none"
      style={{
        backgroundColor: isLight
          ? "rgba(var(--luna-accent-rgb), 0.2)"
          : "var(--luna-border)",
      }}
      aria-label={isLight ? "ダークモードに切り替え" : "ライトモードに切り替え"}
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
