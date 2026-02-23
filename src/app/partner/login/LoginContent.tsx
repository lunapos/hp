"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import { LogIn, ArrowRight } from "lucide-react";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/partner/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/partner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "ログインに失敗しました");
      }

      router.push(redirectTo);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "ログインに失敗しました"
      );
    }
  };

  return (
    <>
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-emerald-400 text-sm tracking-[0.3em] font-medium mb-2">
            PARTNER LOGIN
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            パートナーログイン
          </h1>
          <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full" />
        </div>
      </section>

      <Section>
        <div className="max-w-md mx-auto">
          <Card className="border-emerald-400/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">ログイン</h2>
                <p className="text-luna-text-secondary text-xs">
                  パートナーダッシュボードへアクセス
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-luna-bg border border-luna-border rounded-xl px-4 py-3 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                  placeholder="tanaka@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-luna-bg border border-luna-border rounded-xl px-4 py-3 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                  placeholder="パスワードを入力"
                />
              </div>

              {status === "error" && (
                <p className="text-red-400 text-sm">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className={`w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-lg tracking-wider hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 ${
                  status === "submitting"
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                {status === "submitting" ? (
                  "ログイン中..."
                ) : (
                  <>
                    ログイン
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-luna-text-secondary text-sm">
              アカウントをお持ちでない方は{" "}
              <Link
                href="/partner"
                className="text-emerald-400 hover:underline"
              >
                パートナー登録
              </Link>
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
