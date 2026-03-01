"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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

export default function PartnerContent() {
  const router = useRouter();
  const t = useTranslations("partner");
  const tCommon = useTranslations("common");

  const benefits = [
    {
      icon: BadgeJapaneseYen,
      title: t("benefits.0.title"),
      desc: t("benefits.0.description"),
    },
    {
      icon: Megaphone,
      title: t("benefits.1.title"),
      desc: t("benefits.1.description"),
    },
    {
      icon: HeadphonesIcon,
      title: t("benefits.2.title"),
      desc: t("benefits.2.description"),
    },
  ];

  const steps = [
    { number: "01", title: t("steps.0.title"), desc: t("steps.0.description") },
    { number: "02", title: t("steps.1.title"), desc: t("steps.1.description") },
    { number: "03", title: t("steps.2.title"), desc: t("steps.2.description") },
    { number: "04", title: t("steps.3.title"), desc: t("steps.3.description") },
  ];

  const partnerTypes = [
    { value: "individual", label: t("partnerTypes.individual") },
    { value: "corporation", label: t("partnerTypes.corporate") },
    { value: "owner", label: t("partnerTypes.owner") },
    { value: "other", label: t("partnerTypes.other") },
  ];

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
      setErrorMessage(t("passwordMismatch"));
      return;
    }

    if (form.password.length < 6) {
      setStatus("error");
      setErrorMessage(t("passwordTooShort"));
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
        throw new Error(data.error || t("registerError"));
      }

      setStatus("success");
      setForm(initialForm);
      // Auto-redirect to dashboard after a short delay
      setTimeout(() => router.push("/partner/dashboard"), 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : t("registerError")
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
              {t("successTitle")}
            </h1>
            <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full" />
          </div>
        </section>
        <Section>
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-emerald-400/30">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luna-text-primary mb-2">
                {t("successMessage")}
              </h2>
              <p className="text-luna-text-secondary">
                {t("redirecting")}
              </p>
              <div className="mt-6">
                <Button href="/partner/dashboard">{t("toDashboard")}</Button>
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
            {t("title")}
          </h1>
          <div className="w-16 h-1 bg-emerald-400 mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            {t("description")}
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
            {t("stepsTitle")}
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
                  <h2 className="text-xl font-bold text-luna-text-primary">{t("formTitle")}</h2>
                  <p className="text-luna-text-secondary text-xs">
                    {t("formDescription")}
                  </p>
                </div>
              </div>
              <Link
                href="/partner/login"
                className="text-emerald-400 text-sm hover:underline"
              >
                {t("loginLink")}
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  {tCommon("name")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                  placeholder={tCommon("namePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                  {tCommon("email")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                  placeholder={tCommon("emailPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    {t("password")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                    placeholder={t("passwordPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    {t("passwordConfirm")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                    placeholder={t("passwordConfirmPlaceholder")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    {tCommon("phone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all"
                    placeholder={tCommon("phonePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    {t("partnerType")}
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
                  t("registering")
                ) : (
                  <>
                    {t("register")}
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
