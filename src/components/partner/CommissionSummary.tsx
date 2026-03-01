"use client";

import { Download, Calendar, Wallet, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import type { Commission } from "@/types/partner";

interface CommissionSummaryProps {
  commissions: Commission[];
}

function formatYen(amount: number) {
  return `\u00a5${amount.toLocaleString("ja-JP")}`;
}

export default function CommissionSummary({
  commissions,
}: CommissionSummaryProps) {
  const t = useTranslations("commission");
  const tDashboard = useTranslations("dashboard");

  const totalEarned = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0);

  const now = new Date();
  const thisMonth = commissions
    .filter((c) => {
      const d = new Date(c.created_at);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    })
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingPayout = commissions
    .filter((c) => c.status === "pending" || c.status === "approved")
    .reduce((sum, c) => sum + c.amount, 0);

  const lastPaid = commissions.find((c) => c.status === "paid");
  const lastPaidDate = lastPaid
    ? new Date(lastPaid.paid_at || lastPaid.created_at).toLocaleDateString(
        "ja-JP"
      )
    : "-";

  const handleExportCSV = () => {
    const header = t("csvHeaders") + "\n";
    const rows = commissions
      .map((c) => {
        const date = new Date(c.created_at).toLocaleDateString("ja-JP");
        const statusMap: Record<string, string> = {
          pending: tDashboard("statusLabels.pending"),
          approved: tDashboard("statusLabels.approved"),
          paid: tDashboard("statusLabels.paid"),
        };
        return `${date},${c.amount},${statusMap[c.status] || c.status},${c.note || ""}`;
      })
      .join("\n");

    const csv = header + rows;
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    a.href = url;
    a.download = `lunapos-commissions-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    {
      icon: Wallet,
      label: t("totalPaid"),
      value: formatYen(totalEarned),
    },
    {
      icon: Calendar,
      label: t("thisMonth"),
      value: formatYen(thisMonth),
    },
    {
      icon: Clock,
      label: t("unpaid"),
      value: formatYen(pendingPayout),
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-luna-text-primary font-bold">{t("title")}</h3>
        {commissions.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {t("csvExport")}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-luna-text-secondary text-xs">
                  {card.label}
                </span>
              </div>
              <p className="text-lg font-bold text-luna-text-primary">
                {card.value}
              </p>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-luna-text-secondary">
        {t("lastPayment")} {lastPaidDate}
      </p>
    </div>
  );
}
