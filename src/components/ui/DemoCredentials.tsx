"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { DEMO_DEVICE_TOKEN } from "@/lib/constants";

/**
 * デモ店舗の端末トークンを表示するブロック。
 * アプリ初回起動時の端末認証画面に入力してもらう値なので、
 * iPadから見て「そのままコピーできる」ことを優先する。
 */
export default function DemoCredentials({ label }: { label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_DEVICE_TOKEN);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードが使えない環境では選択してコピーしてもらう
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <span className="text-xs text-luna-text-muted">{label}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="group inline-flex items-center gap-3 rounded-xl border border-luna-gold/30 bg-luna-surface px-4 py-2.5 transition-colors hover:border-luna-gold/60"
      >
        <code className="font-mono text-lg tracking-[0.15em] text-luna-gold select-all">
          {DEMO_DEVICE_TOKEN}
        </code>
        {copied ? (
          <Check className="h-4 w-4 shrink-0 text-luna-gold" />
        ) : (
          <Copy className="h-4 w-4 shrink-0 text-luna-text-muted transition-colors group-hover:text-luna-gold" />
        )}
      </button>
    </div>
  );
}
