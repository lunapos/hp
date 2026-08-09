"use client";

import { APP_STORE_URL } from "@/lib/constants";

type Variant = "primary" | "outline";
type Size = "md" | "lg";

/** Apple ロゴ（App Store 導線用） */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.05 12.54c.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.03 1.01 8 .67.96 1.47 2.04 2.52 2 1.01-.04 1.39-.65 2.62-.65 1.22 0 1.57.65 2.64.63 1.09-.02 1.78-.98 2.45-1.95.77-1.12 1.09-2.2 1.11-2.26-.02-.01-2.13-.82-2.15-3.24zM15.05 6.6c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.97 1.56-.85 2.48.9.07 1.83-.46 2.39-1.13z" />
    </svg>
  );
}

/**
 * App Store でアプリを配布するための導線ボタン。
 * クリックを GA4 の app_store_click として記録し、
 * どの導線が効いているかを location で切り分ける。
 */
export default function AppStoreButton({
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
    outline: "border border-luna-gold/40 text-luna-gold hover:bg-luna-gold/10",
  };

  const handleClick = () => {
    (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.(
      "event",
      "app_store_click",
      { location }
    );
  };

  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      <AppleIcon className="w-[18px] h-[18px]" />
      {label}
    </a>
  );
}
