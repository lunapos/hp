"use client";

import { useState } from "react";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Landmark,
  BarChart3,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface FormState {
  name: string;
  email: string;
  phone: string;
  investmentType: string;
  message: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  investmentType: "store",
  message: "",
};

const investmentTypes = [
  { value: "store", label: "店舗への投資に興味がある" },
  { value: "both", label: "事業と店舗の両方に興味がある" },
  { value: "other", label: "その他・まずは話を聞きたい" },
];

const features = [
  {
    icon: BarChart3,
    title: "データに基づく投資判断",
    desc: "LunaPos導入店舗のリアルな売上・経営データをもとに、投資先を選定できます。",
  },
  {
    icon: Shield,
    title: "リスクの可視化",
    desc: "売上推移・客単価・リピート率など、店舗の健全性を示す指標を事前に確認。",
  },
  {
    icon: TrendingUp,
    title: "成長ポテンシャルの評価",
    desc: "キャスト実績・顧客基盤など、将来性を示すデータで投資判断をサポート。",
  },
];

export default function FundContent() {
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

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: "Luna Fund 事前登録",
          name: form.name,
          email: form.email,
          phone: form.phone,
          inquiryType: "Luna Fund 事前登録",
          message: `投資タイプ: ${
            investmentTypes.find((t) => t.value === form.investmentType)
              ?.label ?? form.investmentType
          }\n\n${form.message}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }

      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "送信に失敗しました"
      );
    }
  };

  if (status === "success") {
    return (
      <>
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-purple-400 text-sm tracking-[0.3em] font-medium mb-2">
              LUNA FUND
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
              事前登録完了
            </h1>
            <div className="w-16 h-1 bg-purple-400 mx-auto rounded-full" />
          </div>
        </section>
        <Section>
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-purple-400/30">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luna-text-primary mb-2">
                ウェイティングリストに登録しました
              </h2>
              <p className="text-luna-text-secondary">
                Luna Fund の詳細が決まり次第、
                <br />
                ご登録いただいたメールアドレスにご連絡いたします。
              </p>
              <div className="mt-6">
                <Button href="/">トップページに戻る</Button>
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
          <p className="text-purple-400 text-sm tracking-[0.3em] font-medium mb-2">
            LUNA FUND
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
            店舗投資プログラム
          </h1>
          <div className="w-16 h-1 bg-purple-400 mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            LunaPos導入店舗の経営データをもとに、有望な店舗への出資・融資が可能になるプログラムを準備中です。
          </p>
          <span className="inline-block mt-3 text-xs bg-purple-400/20 text-purple-300 px-3 py-1 rounded-full font-medium">
            準備中 - 事前登録受付中
          </span>
        </div>
      </section>

      {/* Features */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={i} hover>
                <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-luna-text-primary font-bold mb-2">{feature.title}</h3>
                <p className="text-luna-text-secondary text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Waitlist Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-purple-400/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-luna-text-primary">事前登録</h2>
                <p className="text-luna-text-secondary text-xs">
                  プログラム開始時に優先的にご案内いたします
                </p>
              </div>
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
                  className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                  placeholder="例: 田中 太郎"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                    placeholder="例: tanaka@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                    placeholder="例: 03-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  ご興味のある投資タイプ
                </label>
                <select
                  name="investmentType"
                  value={form.investmentType}
                  onChange={handleChange}
                  className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                >
                  {investmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  メッセージ（任意）
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all resize-none"
                  placeholder="ご質問やご要望がございましたらご記入ください"
                />
              </div>

              {status === "error" && (
                <p className="text-red-400 text-sm">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className={`w-full bg-purple-500 text-white py-3 rounded-xl font-bold text-lg tracking-wider hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 ${
                  status === "submitting"
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                {status === "submitting" ? (
                  "送信中..."
                ) : (
                  <>
                    事前登録する
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
