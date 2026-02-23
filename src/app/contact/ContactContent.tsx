"use client";

import { useState } from "react";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { BRAND } from "@/lib/constants";
import { Mail, CheckCircle } from "lucide-react";

interface FormState {
  companyName: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
}

const initialForm: FormState = {
  companyName: "",
  name: "",
  email: "",
  phone: "",
  inquiryType: "導入相談",
  message: "",
};

const inquiryTypes = ["導入相談", "投資・出資について", "パートナー募集について", "その他"];

export default function ContactContent() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        body: JSON.stringify(form),
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
            <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
              CONTACT
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              お問い合わせ
            </h1>
            <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full" />
          </div>
        </section>
        <Section>
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-luna-gold/30">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                送信が完了しました
              </h2>
              <p className="text-luna-text-secondary">
                お問い合わせありがとうございます。
                <br />
                通常2営業日以内にご返信いたします。
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
          <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
            CONTACT
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            お問い合わせ
          </h1>
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            導入のご相談・資料請求など、お気軽にお問い合わせください。
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                      会社名・店舗名 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      required
                      className="w-full bg-luna-bg border border-luna-border rounded-xl px-4 py-3 text-white focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                      placeholder="例: Bar Moon"
                    />
                  </div>
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
                      className="w-full bg-luna-bg border border-luna-border rounded-xl px-4 py-3 text-white focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                      placeholder="例: 田中 太郎"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="w-full bg-luna-bg border border-luna-border rounded-xl px-4 py-3 text-white focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
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
                      className="w-full bg-luna-bg border border-luna-border rounded-xl px-4 py-3 text-white focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                      placeholder="例: 03-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    お問い合わせ種別
                  </label>
                  <select
                    name="inquiryType"
                    value={form.inquiryType}
                    onChange={handleChange}
                    className="w-full bg-luna-bg border border-luna-border rounded-xl px-4 py-3 text-white focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    お問い合わせ内容 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-luna-bg border border-luna-border rounded-xl px-4 py-3 text-white focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all resize-none"
                    placeholder="お問い合わせ内容をご記入ください"
                  />
                </div>

                {status === "error" && (
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                )}

                <Button
                  className={`w-full ${
                    status === "submitting" ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {status === "submitting" ? "送信中..." : "送信する"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-luna-gold" />
                <h3 className="text-white font-medium">メール</h3>
              </div>
              <p className="text-luna-text-secondary text-sm">{BRAND.email}</p>
            </Card>


          </div>
        </div>
      </Section>
    </>
  );
}
