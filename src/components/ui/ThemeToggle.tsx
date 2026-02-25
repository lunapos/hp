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
      className="p-2 rounded-lg text-luna-text-secondary hover:text-luna-gold transition-colors duration-200"
      aria-label={isLight ? "ダークモードに切り替え" : "ライトモードに切り替え"}
    >
      {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
