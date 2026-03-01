"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { MessageSquarePlus, Send, CheckCircle } from "lucide-react";

export default function TestimonialSection() {
  const t = useTranslations("testimonial");
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
      <SectionHeading subtitle={t("subtitle")} title={t("title")} />

      <div className="max-w-2xl mx-auto">
        {status === "success" ? (
          <Card className="border-luna-gold/30 text-center py-12">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-luna-text-primary mb-2">
              {t("thankYou")}
            </h3>
            <p className="text-luna-text-secondary text-sm">
              {t("thankYouDescription")}
            </p>
          </Card>
        ) : (
          <Card className="border-luna-border border-dashed">
            <div className="text-center mb-6">
              <MessageSquarePlus className="w-10 h-10 text-luna-gold/40 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-luna-text-primary mb-1">
                {t("formTitle")}
              </h3>
              <p className="text-luna-text-secondary text-sm">
                {t("formDescription")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-luna-text-secondary mb-1">
                    {t("storeName")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.storeName}
                    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                    required
                    className="w-full bg-luna-input-bg border border-luna-border rounded-lg px-3 py-2 text-luna-text-primary text-sm focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                    placeholder={t("storeNamePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm text-luna-text-secondary mb-1">
                    {t("role")}
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-lg px-3 py-2 text-luna-text-primary text-sm focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                    placeholder={t("rolePlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-luna-text-secondary mb-1">
                  {t("feedback")} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={3}
                  className="w-full bg-luna-input-bg border border-luna-border rounded-lg px-3 py-2 text-luna-text-primary text-sm focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all resize-none"
                  placeholder={t("feedbackPlaceholder")}
                />
              </div>

              {status === "error" && (
                <p className="text-red-400 text-sm">{t("submitError")}</p>
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
                  {status === "submitting" ? t("submitting") : t("submit")}
                </button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </Section>
  );
}
