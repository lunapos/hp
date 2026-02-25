"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import {
  Link2,
  MousePointerClick,
  Store,
  BadgeJapaneseYen,
  Wallet,
  Copy,
  Check,
  LogOut,
} from "lucide-react";
import type { Partner, PartnerStats, Conversion, Commission } from "@/types/partner";

interface DashboardContentProps {
  partner: Partner;
  stats: PartnerStats | null;
  conversions: Conversion[];
  commissions: Commission[];
}

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "審査中", className: "bg-yellow-400/20 text-yellow-300" },
  confirmed: { label: "確定", className: "bg-emerald-400/20 text-emerald-300" },
  rejected: { label: "却下", className: "bg-red-400/20 text-red-300" },
  approved: { label: "承認済", className: "bg-emerald-400/20 text-emerald-300" },
  paid: { label: "支払済", className: "bg-blue-400/20 text-blue-300" },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusLabels[status] || {
    label: status,
    className: "bg-luna-text-secondary/20 text-luna-text-secondary",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatYen(amount: number) {
  return `\u00a5${amount.toLocaleString("ja-JP")}`;
}

export default function DashboardContent({
  partner,
  stats,
  conversions,
  commissions,
}: DashboardContentProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const referralUrl = `https://lunapos.jp?ref=${partner.referral_code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/partner/logout", { method: "POST" });
    router.push("/partner/login");
  };

  const statCards = [
    {
      icon: MousePointerClick,
      label: "クリック数",
      value: stats?.total_clicks ?? 0,
    },
    {
      icon: Store,
      label: "成約数",
      value: stats?.total_conversions ?? 0,
    },
    {
      icon: BadgeJapaneseYen,
      label: "未払い報酬",
      value: formatYen((stats?.pending_commission ?? 0) + (stats?.approved_commission ?? 0)),
    },
    {
      icon: Wallet,
      label: "支払い済み",
      value: formatYen(stats?.paid_commission ?? 0),
    },
  ];

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-emerald-400 text-sm tracking-[0.3em] font-medium mb-1">
              PARTNER DASHBOARD
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-luna-text-primary">
              {partner.name} さん
            </h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-luna-text-secondary text-sm hover:text-luna-text-primary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>

        {/* Referral Link */}
        <Card className="border-emerald-400/20 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-luna-text-primary font-bold">あなたの紹介リンク</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-luna-bg border border-luna-border rounded-xl px-4 py-3 text-emerald-400 text-sm font-mono truncate">
              {referralUrl}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl font-medium text-sm hover:bg-emerald-600 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  コピー済
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  コピー
                </>
              )}
            </button>
          </div>
          <p className="text-luna-text-secondary text-xs mt-2">
            紹介コード: {partner.referral_code}
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-luna-text-secondary text-xs">
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-luna-text-primary">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Conversions Table */}
        <div className="mb-8">
          <h2 className="text-luna-text-primary font-bold mb-4">成約一覧</h2>
          <Card>
            {conversions.length === 0 ? (
              <p className="text-luna-text-secondary text-sm text-center py-8">
                まだ成約はありません。紹介リンクを共有して店舗を紹介しましょう。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-luna-border">
                      <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                        日付
                      </th>
                      <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                        店舗名
                      </th>
                      <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversions.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-luna-border/50 last:border-0"
                      >
                        <td className="py-3 px-2 text-luna-text-secondary">
                          {formatDate(c.created_at)}
                        </td>
                        <td className="py-3 px-2 text-luna-text-primary">{c.store_name}</td>
                        <td className="py-3 px-2">
                          <StatusBadge status={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Commissions Table */}
        <div>
          <h2 className="text-luna-text-primary font-bold mb-4">報酬履歴</h2>
          <Card>
            {commissions.length === 0 ? (
              <p className="text-luna-text-secondary text-sm text-center py-8">
                まだ報酬の記録はありません。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-luna-border">
                      <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                        日付
                      </th>
                      <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                        金額
                      </th>
                      <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                        ステータス
                      </th>
                      <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                        備考
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((cm) => (
                      <tr
                        key={cm.id}
                        className="border-b border-luna-border/50 last:border-0"
                      >
                        <td className="py-3 px-2 text-luna-text-secondary">
                          {formatDate(cm.created_at)}
                        </td>
                        <td className="py-3 px-2 text-luna-text-primary font-medium">
                          {formatYen(cm.amount)}
                        </td>
                        <td className="py-3 px-2">
                          <StatusBadge status={cm.status} />
                        </td>
                        <td className="py-3 px-2 text-luna-text-secondary">
                          {cm.note || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
