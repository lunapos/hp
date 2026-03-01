"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { NAV_ITEMS } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-luna-bg/90 backdrop-blur-md border-b border-luna-border z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-xl font-bold"
          >
            <Image src="/icon.png" alt="LunaPos" width={24} height={24} />
            <span className="text-luna-gold tracking-wider">LunaPos</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors duration-200 ${
                  pathname === item.href
                    ? "text-luna-gold"
                    : "text-luna-text-secondary hover:text-luna-text-primary"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
            <ThemeToggle />
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-1.5 w-10 h-10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? t("menuClose") : t("menuOpen")}
              aria-expanded={isMenuOpen}
            >
              <span
                className={`block w-6 h-0.5 bg-luna-text-secondary transition-transform duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-luna-text-secondary transition-opacity duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-luna-text-secondary transition-transform duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay - outside header to avoid stacking context issues */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[60]"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-in panel */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 w-64 z-[70] pt-4 bg-luna-bg/95 backdrop-blur-md border-l border-luna-border transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end px-4">
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg text-luna-text-secondary hover:text-luna-gold transition-colors"
            aria-label={t("menuClose")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex flex-col px-6 pb-6 gap-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`py-2 border-b border-luna-border transition-colors duration-200 ${
                pathname === item.href
                  ? "text-luna-gold"
                  : "text-luna-text-secondary hover:text-luna-text-primary"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
