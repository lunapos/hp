"use client";

import { MessageCircle } from "lucide-react";

// TODO: 実運用時は LINE_URL を公式アカウントの友達追加URLに変更
const LINE_URL = "/contact";

export default function FloatingLineButton() {
  return (
    <a
      href={LINE_URL}
      className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 bg-[#06C755] text-white rounded-2xl shadow-lg hover:bg-[#05b64d] transition-all duration-200 hover:scale-105 pl-4 pr-5 py-3"
    >
      <MessageCircle className="w-5 h-5 shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-bold leading-tight">LINE友達追加</span>
        <span className="text-[10px] opacity-80 leading-tight">
          導入相談・お問い合わせもこちら
        </span>
      </div>
    </a>
  );
}
