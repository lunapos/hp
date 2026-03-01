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
import { useTranslations } from "next-intl";

interface FormState {
  name: string;
  email: string;
  phone: string;
  investmentType: string;
  message: string;
}

const featureIcons = [BarChart3, Shield, TrendingUp];

export default function FundContent() {
  const t = useTranslations('fund');
  const tCommon = useTranslations('common');

  const investmentTypes = [
    { value: "store", label: t('investmentTypes.store') },
    { value: "both", label: t('investmentTypes.both') },
    { value: "other", label: t('investmentTypes.other') },
  ];

  const features = ([0, 1, 2] as const).map((i) => ({
    icon: featureIcons[i],
    title: t(`features.${i}.title`),
    desc: t(`features.${i}.description`),
  }));

  const initialForm: FormState = {
    name: "",
    email: "",
    phone: "",
    investmentType: "store",
    message: "",
  };

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
            investmentTypes.find((tp) => tp.value === form.investmentType)
              ?.label ?? form.investmentType
          }\n\n${form.message}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || tCommon('submitError'));
      }

      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : tCommon('submitError')
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
              {t('successTitle')}
            </h1>
            <div className="w-16 h-1 bg-purple-400 mx-auto rounded-full" />
          </div>
        </section>
        <Section>
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-purple-400/30">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luna-text-primary mb-2">
                {t('successMessage')}
              </h2>
              <p className="text-luna-text-secondary">
                {t('successDescription')}
              </p>
              <div className="mt-6">
                <Button href="/">{tCommon('backToTop')}</Button>
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
            {t('subtitle')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
            {t('title')}
          </h1>
          <div className="w-16 h-1 bg-purple-400 mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            {t('description')}
          </p>
          <span className="inline-block mt-3 text-xs bg-purple-400/20 text-purple-300 px-3 py-1 rounded-full font-medium">
            {t('badge')}
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
                <h2 className="text-xl font-bold text-luna-text-primary">{t('formTitle')}</h2>
                <p className="text-luna-text-secondary text-xs">
                  {t('formDescription')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  {tCommon('name')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                  placeholder={tCommon('namePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    {tCommon('email')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                    placeholder={tCommon('emailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    {tCommon('phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                    placeholder={tCommon('phonePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  {t('investmentType')}
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
                  {t('message')}
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all resize-none"
                  placeholder={t('messagePlaceholder')}
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
                  tCommon('submitting')
                ) : (
                  <>
                    {t('submitButton')}
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
