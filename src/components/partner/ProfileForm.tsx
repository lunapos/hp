"use client";

import { useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import type { Partner } from "@/types/partner";

const partnerTypes = [
  { value: "individual", label: "個人（フリーランス・副業）" },
  { value: "corporation", label: "法人（代理店・コンサル）" },
  { value: "owner", label: "店舗オーナー（他店舗の紹介）" },
  { value: "other", label: "その他" },
];

interface ProfileFormProps {
  partner: Partner;
}

export default function ProfileForm({ partner }: ProfileFormProps) {
  const [name, setName] = useState(partner.name);
  const [phone, setPhone] = useState(partner.phone || "");
  const [partnerType, setPartnerType] = useState(partner.partner_type);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/partner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, partner_type: partnerType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-luna-input-bg border border-luna-border rounded-xl px-4 py-3 text-luna-text-primary focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all text-sm";
  const labelClass =
    "block text-sm text-luna-text-secondary tracking-wider mb-2";

  return (
    <Card>
      <h3 className="text-luna-text-primary font-bold mb-6">
        プロフィール設定
      </h3>

      <div className="space-y-5 max-w-lg">
        <div>
          <label className={labelClass}>名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>メールアドレス</label>
          <input
            type="email"
            value={partner.email}
            disabled
            className={`${inputClass} opacity-50 cursor-not-allowed`}
          />
          <p className="text-xs text-luna-text-secondary mt-1">
            メールアドレスは変更できません
          </p>
        </div>

        <div>
          <label className={labelClass}>電話番号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="090-0000-0000"
          />
        </div>

        <div>
          <label className={labelClass}>パートナー種別</label>
          <select
            value={partnerType}
            onChange={(e) =>
              setPartnerType(
                e.target.value as Partner["partner_type"]
              )
            }
            className={inputClass}
          >
            {partnerTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 border-t border-luna-border">
          <div className="flex items-center gap-3 text-sm text-luna-text-secondary mb-1">
            <span>紹介コード:</span>
            <span className="font-mono text-emerald-400">
              {partner.referral_code}
            </span>
          </div>
          <div className="text-sm text-luna-text-secondary">
            アカウント作成日:{" "}
            {new Date(partner.created_at).toLocaleDateString("ja-JP")}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              保存しました
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saving ? "保存中..." : "保存"}
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
