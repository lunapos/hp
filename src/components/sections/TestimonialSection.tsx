"use client";

import { useState } from "react";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { MessageSquarePlus, Send, CheckCircle } from "lucide-react";

export default function TestimonialSection() {
  const [form, setForm] = useState({ storeName: "", role: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ storeName: "", role: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <Section>
      <SectionHeading subtitle="VOICE" title="導入店舗の声" />

      <div className="max-w-2xl mx-auto">
        {status === "success" ? (
          <Card className="border-luna-gold/30 text-center py-12">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-luna-text-primary mb-2">
              ご投稿ありがとうございます
            </h3>
            <p className="text-luna-text-secondary text-sm">
              確認後、掲載させていただきます。
            </p>
          </Card>
        ) : (
          <Card className="border-luna-border border-dashed">
            <div className="text-center mb-6">
              <MessageSquarePlus className="w-10 h-10 text-luna-gold/40 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-luna-text-primary mb-1">
                お客様の声を募集しています
              </h3>
              <p className="text-luna-text-secondary text-sm">
                導入いただいた店舗様からのフィードバックを順次掲載予定です。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-luna-text-secondary mb-1">
                    店舗名（仮名OK） <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.storeName}
                    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                    required
                    className="w-full bg-luna-input-bg border border-luna-border rounded-lg px-3 py-2 text-luna-text-primary text-sm focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                    placeholder="例: Bar Moon"
                  />
                </div>
                <div>
                  <label className="block text-sm text-luna-text-secondary mb-1">
                    役職
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-lg px-3 py-2 text-luna-text-primary text-sm focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                    placeholder="例: オーナー"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-luna-text-secondary mb-1">
                  ご感想・フィードバック <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={3}
                  className="w-full bg-luna-input-bg border border-luna-border rounded-lg px-3 py-2 text-luna-text-primary text-sm focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all resize-none"
                  placeholder="LunaPosを使ってみた感想をお聞かせください"
                />
              </div>

              {status === "error" && (
                <p className="text-red-400 text-sm">送信に失敗しました。もう一度お試しください。</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className={`inline-flex items-center gap-2 bg-luna-gold text-luna-bg px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-luna-gold-light transition-colors ${
                    status === "submitting" ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {status === "submitting" ? "送信中..." : "送信する"}
                </button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </Section>
  );
}
