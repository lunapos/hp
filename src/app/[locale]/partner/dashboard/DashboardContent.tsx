"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import TrendChart from "@/components/partner/TrendChart";
import ClickBreakdown from "@/components/partner/ClickBreakdown";
import DateRangeFilter, {
  type Period,
} from "@/components/partner/DateRangeFilter";
import CommissionSummary from "@/components/partner/CommissionSummary";
import ProfileForm from "@/components/partner/ProfileForm";
import {
  Link2,
  MousePointerClick,
  Store,
  CheckCircle,
  TrendingUp,
  BadgeJapaneseYen,
  Wallet,
  Copy,
  Check,
  LogOut,
  LayoutDashboard,
  Settings,
  Bell,
  X,
} from "lucide-react";
import type {
  Partner,
  PartnerStats,
  Conversion,
  Commission,
  ClickBreakdown as ClickBreakdownType,
  DailyStats,
} from "@/types/partner";

type TabKey = "overview" | "conversions" | "commissions" | "settings";

interface DashboardContentProps {
  partner: Partner;
  stats: PartnerStats | null;
  conversions: Conversion[];
  commissions: Commission[];
  clickBreakdown: ClickBreakdownType[];
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
  clickBreakdown,
}: DashboardContentProps) {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [period, setPeriod] = useState<Period>("30d");
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [newItemCount, setNewItemCount] = useState(0);

  const referralUrl = `https://lunapos.jp?ref=${partner.referral_code}`;

  const statusLabels: Record<string, { label: string; className: string }> = {
    pending: { label: t("statusLabels.pending"), className: "bg-yellow-400/20 text-yellow-300" },
    confirmed: { label: t("statusLabels.confirmed"), className: "bg-emerald-400/20 text-emerald-300" },
    rejected: { label: t("statusLabels.rejected"), className: "bg-red-400/20 text-red-300" },
    approved: { label: t("statusLabels.approved"), className: "bg-emerald-400/20 text-emerald-300" },
    paid: { label: t("statusLabels.paid"), className: "bg-blue-400/20 text-blue-300" },
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

  const TABS: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: t("tabs.overview"), icon: LayoutDashboard },
    { key: "conversions", label: t("tabs.conversions"), icon: Store },
    { key: "commissions", label: t("tabs.rewards"), icon: Wallet },
    { key: "settings", label: t("tabs.settings"), icon: Settings },
  ];

  const statCards = [
    {
      icon: MousePointerClick,
      label: t("stats.clicks"),
      value: stats?.total_clicks ?? 0,
    },
    {
      icon: Store,
      label: t("stats.conversions"),
      value: stats?.total_conversions ?? 0,
    },
    {
      icon: CheckCircle,
      label: t("stats.confirmed"),
      value: stats?.confirmed_conversions ?? 0,
    },
    {
      icon: TrendingUp,
      label: t("stats.cvr"),
      value: `${(stats?.total_clicks ?? 0) > 0
        ? (((stats?.total_conversions ?? 0) / (stats?.total_clicks ?? 1)) * 100).toFixed(1)
        : "0.0"}%`,
    },
    {
      icon: BadgeJapaneseYen,
      label: t("stats.unpaid"),
      value: formatYen(
        (stats?.pending_commission ?? 0) + (stats?.approved_commission ?? 0)
      ),
    },
    {
      icon: Wallet,
      label: t("stats.paid"),
      value: formatYen(stats?.paid_commission ?? 0),
    },
  ];

  // Notification: check for new items since last visit
  useEffect(() => {
    const lastVisit = localStorage.getItem("luna-partner-last-visit");
    if (lastVisit) {
      const lastDate = new Date(lastVisit);
      const newConversions = conversions.filter(
        (c) => new Date(c.created_at) > lastDate
      ).length;
      const newCommissions = commissions.filter(
        (c) => new Date(c.created_at) > lastDate
      ).length;
      const total = newConversions + newCommissions;
      if (total > 0) {
        setNewItemCount(total);
        setShowNotification(true);
      }
    }
    localStorage.setItem(
      "luna-partner-last-visit",
      new Date().toISOString()
    );
  }, [conversions, commissions]);

  // Fetch daily stats when period changes
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/partner/stats?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setDailyData(data.daily || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingStats(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  // Prepare chart data
  const chartData = dailyData.map((d) => ({
    label: d.date.slice(5), // MM-DD
    value: d.clicks,
  }));
  const convChartData = dailyData.map((d) => ({
    label: d.date.slice(5),
    value: d.conversions,
  }));

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Notification Bar */}
        {showNotification && (
          <div className="flex items-center justify-between bg-emerald-400/10 border border-emerald-400/30 rounded-xl px-4 py-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Bell className="w-4 h-4" />
              {t("newNotifications", { count: newItemCount })}
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-emerald-400 hover:text-emerald-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-emerald-400 text-sm tracking-[0.3em] font-medium mb-1">
              {t("subtitle")}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-luna-text-primary">
              {t("greeting", { name: partner.name })}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-luna-text-secondary text-sm hover:text-luna-text-primary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </button>
        </div>

        {/* Referral Link */}
        <Card className="border-emerald-400/20 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-luna-text-primary font-bold">
              {t("referralLink")}
            </h2>
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
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t("copy")}
                </>
              )}
            </button>
          </div>
          <p className="text-luna-text-secondary text-xs mt-2">
            {t("referralCode")} {partner.referral_code}
          </p>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-luna-border mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-luna-text-secondary hover:text-luna-text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Period Filter */}
            <div className="mb-4">
              <DateRangeFilter value={period} onChange={setPeriod} />
            </div>

            {/* Stats Grid */}
            <div
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 transition-opacity ${loadingStats ? "opacity-50" : ""}`}
            >
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
                    <p className="text-xl font-bold text-luna-text-primary">
                      {stat.value}
                    </p>
                  </Card>
                );
              })}
            </div>

            {/* Trend Charts */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <TrendChart data={chartData} title={t("chartClicks")} />
                </Card>
                <Card>
                  <TrendChart
                    data={convChartData}
                    title={t("chartConversions")}
                    color="bg-blue-400"
                  />
                </Card>
              </div>
            )}

            {/* Click Breakdown */}
            <Card className="mb-6">
              <ClickBreakdown data={clickBreakdown} />
            </Card>
          </>
        )}

        {activeTab === "conversions" && (
          <div>
            <h2 className="text-luna-text-primary font-bold mb-4">{t("conversionsTitle")}</h2>
            <Card>
              {conversions.length === 0 ? (
                <p className="text-luna-text-secondary text-sm text-center py-8">
                  {t("conversionsEmpty")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-luna-border">
                        <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                          {t("conversionsHeaders.date")}
                        </th>
                        <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                          {t("conversionsHeaders.store")}
                        </th>
                        <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                          {t("conversionsHeaders.status")}
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
                          <td className="py-3 px-2 text-luna-text-primary">
                            {c.store_name}
                          </td>
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
        )}

        {activeTab === "commissions" && (
          <div>
            <CommissionSummary commissions={commissions} />

            <h2 className="text-luna-text-primary font-bold mb-4">{t("rewardsTitle")}</h2>
            <Card>
              {commissions.length === 0 ? (
                <p className="text-luna-text-secondary text-sm text-center py-8">
                  {t("rewardsEmpty")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-luna-border">
                        <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                          {t("rewardsHeaders.date")}
                        </th>
                        <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                          {t("rewardsHeaders.amount")}
                        </th>
                        <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                          {t("rewardsHeaders.status")}
                        </th>
                        <th className="text-left text-luna-text-secondary font-medium py-3 px-2">
                          {t("rewardsHeaders.note")}
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
        )}

        {activeTab === "settings" && <ProfileForm partner={partner} />}
      </div>
    </div>
  );
}
