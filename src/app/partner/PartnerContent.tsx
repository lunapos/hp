"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Handshake,
  BadgeJapaneseYen,
  Megaphone,
  HeadphonesIcon,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  partnerType: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  partnerType: "individual",
};

const partnerTypes = [
  { value: "individual", label: "個人（フリーランス・副業）" },
  { value: "corporation", label: "法人（代理店・コンサル）" },
  { value: "owner", label: "店舗オーナー（他店舗の紹介）" },
  { value: "other", label: "その他・まずは話を聞きたい" },
];

const benefits = [
  {
    icon: BadgeJapaneseYen,
    title: "紹介報酬",
    desc: "紹介した店舗がLunaPosを導入するたびに紹介報酬をお支払い。継続利用に応じた継続報酬も用意しています。",
  },
  {
    icon: Megaphone,
    title: "紹介するだけでOK",
    desc: "導入サポートや技術対応はすべてLunaPosチームが対応。あなたは店舗を紹介するだけで大丈夫です。",
  },
  {
    icon: HeadphonesIcon,
    title: "パートナー専用サポート",
    desc: "専用の担当者がつき、販促資料の提供や紹介状況の共有など、手厚くサポートします。",
  },
];

const steps = [
  { number: "01", title: "パートナー登録", desc: "下記フォームから登録" },
  { number: "02", title: "店舗を紹介", desc: "専用リンクで店舗にLunaPosを紹介" },
  { number: "03", title: "導入サポート", desc: "導入対応はLunaPosチームにお任せ" },
  { number: "04", title: "報酬受取", desc: "導入確定後に紹介報酬をお支払い" },
];

export default function PartnerContent() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    if (form.password !== form.confirmPassword) {
      setStatus("error");
      setErrorMessage("パスワードが一致しません");
      return;
    }

    if (form.password.length < 1) {
      setStatus("error");
      setErrorMessage("パスワードを入力してください");
      return;
    }

    try {
      const res = await fetch("/api/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          partnerType: form.partnerType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "登録に失敗しました");
      }

      setStatus("success");
      setForm(initialForm);
      // Auto-redirect to dashboard after a short delay
      setTimeout(() => router.push("/partner/dashboard"), 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "登録に失敗しました"
      );
    }
  };

  if (status === "success") {
    return (
      <>
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-emerald-400 text-sm tracking-[0.3em] font-medium mb-2">
              PARTNER PROGRAM
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
              登録完了
            </h1>
            <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full" />
          </div>
        </section>
        <Section>
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-emerald-400/30">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luna-text-primary mb-2">
                パートナー登録が完了しました
              </h2>
              <p className="text-luna-text-secondary">
                ダッシュボードへ移動します...
              </p>
              <div className="mt-6">
                <Button href="/partner/dashboard">ダッシュボードへ</Button>
              </div>
            </Card>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      {/* Page Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-emerald-400 text-sm tracking-[0.3em] font-medium mb-2">
            PARTNER PROGRAM
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
            アフィリエイトパートナー募集
          </h1>
          <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            ナイト業界に精通したあなたの人脈を活かして、
            <br className="hidden md:block" />
            LunaPosを紹介するだけで報酬を獲得できます。
          </p>
        </div>
      </section>

      {/* Benefits */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <Card key={i} hover>
                <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-luna-text-primary font-bold mb-2">{benefit.title}</h3>
                <p className="text-luna-text-secondary text-sm leading-relaxed">
                  {benefit.desc}
                </p>
              </Card>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-luna-text-primary text-center mb-8">
            パートナーの流れ
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-emerald-400/30 mb-2">
                  {step.number}
                </div>
                <h3 className="text-luna-text-primary font-bold text-sm mb-1">
                  {step.title}
                </h3>
                <p className="text-luna-text-secondary text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-emerald-400/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-luna-text-primary">パートナー登録</h2>
                  <p className="text-luna-text-secondary text-xs">
                    実装完了後に専用リンクをお送りします
                  </p>
                </div>
              </div>
              <Link
                href="/partner/login"
                className="text-emerald-400 text-sm hover:underline"
              >
                ログインはこちら
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  お名前 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                  placeholder="例: 田中 太郎"
                />
              </div>

              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                  placeholder="例: tanaka@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    パスワード <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={1}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                    placeholder="パスワードを入力"
                  />
                </div>
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    パスワード確認 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={1}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                    placeholder="もう一度入力"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                    placeholder="例: 090-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    パートナー種別
                  </label>
                  <select
                    name="partnerType"
                    value={form.partnerType}
                    onChange={handleChange}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                  >
                    {partnerTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  "登録中..."
                ) : (
                  <>
                    パートナー登録する
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>
      </Section>
    </>
  );
}
