"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative bg-luna-bg border-b border-luna-border z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
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
              {item.label}
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
            aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
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

      <div
        className={`md:hidden absolute top-full right-0 w-64 bg-luna-bg/95 backdrop-blur-md border-l border-b border-luna-border transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col p-6 gap-4">
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
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="mt-2 text-luna-gold font-medium"
          >
            お問い合わせ
          </Link>
        </nav>
      </div>

      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[-1]"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
