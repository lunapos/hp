"use client";

import { MonitorPlay } from "lucide-react";
import { DEMO_URL } from "@/lib/constants";

type Variant = "primary" | "outline";
type Size = "md" | "lg";

/**
 * デモ導線ボタン。
 * クリックを GA4 の demo_click として記録し、どの導線が効いているかを
 * location で切り分けられるようにする（hero / features / faq 等）。
 */
export default function DemoButton({
  label,
  location,
  variant = "primary",
  size = "lg",
  className = "",
}: {
  label: string;
  location: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]";

  const sizes: Record<Size, string> = {
    md: "h-11 px-5 text-sm",
    lg: "h-14 px-7 text-base",
  };

  const variants: Record<Variant, string> = {
    // 文字色は固定の濃紺。luna-bg はライトモードで白に転ぶため使わない
    primary:
      "bg-luna-gold text-[#1a1040] hover:bg-luna-gold-light shadow-lg shadow-luna-gold/20",
    outline:
      "border border-luna-gold/40 text-luna-gold hover:bg-luna-gold/10",
  };

  const handleClick = () => {
    (
      window as unknown as { gtag?: (...args: unknown[]) => void }
    ).gtag?.("event", "demo_click", { location });
  };

  return (
    <a
      href={DEMO_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      <MonitorPlay className="w-[18px] h-[18px]" />
      {label}
    </a>
  );
}
