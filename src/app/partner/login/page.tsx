import type { Metadata } from "next";
import { Suspense } from "react";
import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "パートナーログイン",
  description: "LunaPosアフィリエイトパートナー専用ログイン",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
