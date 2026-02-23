import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardContent from "./DashboardContent";

export const metadata: Metadata = {
  title: "パートナーダッシュボード",
  description: "LunaPosアフィリエイトパートナー専用管理画面",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/partner/login");
  }

  // Fetch partner data
  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!partner) {
    redirect("/partner/login");
  }

  // Fetch stats from view
  const { data: stats } = await supabase
    .from("partner_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch recent conversions
  const { data: conversions } = await supabase
    .from("conversions")
    .select("*")
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch commissions
  const { data: commissions } = await supabase
    .from("commissions")
    .select("*")
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <DashboardContent
      partner={partner}
      stats={stats}
      conversions={conversions || []}
      commissions={commissions || []}
    />
  );
}
