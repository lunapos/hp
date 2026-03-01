"use client";

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Mail, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface FormState {
  companyName: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
}

export default function ContactContent() {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');

  const inquiryTypes = [
    t('inquiryTypes.consultation'),
    t('inquiryTypes.request'),
    t('inquiryTypes.investment'),
    t('inquiryTypes.partnership'),
    t('inquiryTypes.other'),
  ];

  const initialForm: FormState = {
    companyName: "",
    name: "",
    email: "",
    phone: "",
    inquiryType: inquiryTypes[0],
    message: "",
  };

  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type");
  const [form, setForm] = useState<FormState>({
    ...initialForm,
    inquiryType: inquiryTypes.includes(defaultType || "") ? defaultType! : initialForm.inquiryType,
  });
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
        throw new Error(data.error || tCommon('submitError'));
      }

      setStatus("success");
      setForm(initialForm);
      window.gtag?.("event", "generate_lead", {
        event_category: "contact",
        event_label: form.inquiryType,
        source: "hp",
      });
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
            <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
              {t('subtitle')}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
              {t('title')}
            </h1>
            <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full" />
          </div>
        </section>
        <Section>
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-luna-gold/30">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-luna-text-primary mb-2">
                {t('success')}
              </h2>
              <p className="text-luna-text-secondary">
                {t('successDescription')}
                <br />
                {t('successFollowUp')}
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
          <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
            {t('subtitle')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-luna-text-primary mb-4">
            {t('title')}
          </h1>
          <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full mb-4" />
          <p className="text-luna-text-secondary max-w-2xl mx-auto">
            {t('description')}
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
                      {t('companyName')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      required
                      className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                      placeholder={t('companyPlaceholder')}
                    />
                  </div>
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
                      className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                      placeholder={tCommon('namePlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
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
                      className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
                      placeholder={tCommon('phonePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-luna-text-secondary tracking-wider mb-2">
                    {t('inquiryType')}
                  </label>
                  <select
                    name="inquiryType"
                    value={form.inquiryType}
                    onChange={handleChange}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all"
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
                    {t('inquiryContent')}
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-luna-gold focus:ring-1 focus:ring-luna-gold outline-none transition-all resize-none"
                    placeholder={t('inquiryPlaceholder')}
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
                  {status === "submitting" ? tCommon('submitting') : tCommon('submit')}
                </Button>
              </form>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-luna-gold" />
                <h3 className="text-luna-text-primary font-medium">{t('emailTitle')}</h3>
              </div>
              <p className="text-luna-text-secondary text-sm">contact@lunapos.jp</p>
            </Card>


          </div>
        </div>
      </Section>
    </>
  );
}
