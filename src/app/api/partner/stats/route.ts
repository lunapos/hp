import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: partner } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!partner) {
      return NextResponse.json(
        { error: "パートナーが見つかりません" },
        { status: 404 }
      );
    }

    const period = request.nextUrl.searchParams.get("period") || "30d";

    const now = new Date();
    let fromDate: Date | null = null;
    let prevFromDate: Date | null = null;

    if (period === "7d") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevFromDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    } else if (period === "30d") {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevFromDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    } else if (period === "90d") {
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      prevFromDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    }

    // Fetch clicks in period
    let clicksQuery = supabase
      .from("referral_clicks")
      .select("created_at")
      .eq("partner_id", partner.id);

    if (fromDate) {
      clicksQuery = clicksQuery.gte("created_at", fromDate.toISOString());
    }

    const { data: clicks } = await clicksQuery;

    // Fetch conversions in period
    let conversionsQuery = supabase
      .from("conversions")
      .select("created_at")
      .eq("partner_id", partner.id);

    if (fromDate) {
      conversionsQuery = conversionsQuery.gte(
        "created_at",
        fromDate.toISOString()
      );
    }

    const { data: conversions } = await conversionsQuery;

    // Group by date
    const dailyMap = new Map<string, { clicks: number; conversions: number }>();

    for (const click of clicks || []) {
      const date = click.created_at.split("T")[0];
      const entry = dailyMap.get(date) || { clicks: 0, conversions: 0 };
      entry.clicks++;
      dailyMap.set(date, entry);
    }

    for (const conv of conversions || []) {
      const date = conv.created_at.split("T")[0];
      const entry = dailyMap.get(date) || { clicks: 0, conversions: 0 };
      entry.conversions++;
      dailyMap.set(date, entry);
    }

    // Fill in missing dates
    const daily: { date: string; clicks: number; conversions: number }[] = [];
    if (fromDate) {
      const current = new Date(fromDate);
      while (current <= now) {
        const dateStr = current.toISOString().split("T")[0];
        const entry = dailyMap.get(dateStr) || { clicks: 0, conversions: 0 };
        daily.push({ date: dateStr, ...entry });
        current.setDate(current.getDate() + 1);
      }
    } else {
      // All time - just return existing dates sorted
      const sorted = Array.from(dailyMap.entries()).sort(
        ([a], [b]) => a.localeCompare(b)
      );
      for (const [date, entry] of sorted) {
        daily.push({ date, ...entry });
      }
    }

    const totalClicks = (clicks || []).length;
    const totalConversions = (conversions || []).length;

    // Previous period stats for comparison
    let prevClicks = 0;
    let prevConversions = 0;

    if (prevFromDate && fromDate) {
      const { data: prevClicksData } = await supabase
        .from("referral_clicks")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partner.id)
        .gte("created_at", prevFromDate.toISOString())
        .lt("created_at", fromDate.toISOString());

      const { data: prevConversionsData } = await supabase
        .from("conversions")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partner.id)
        .gte("created_at", prevFromDate.toISOString())
        .lt("created_at", fromDate.toISOString());

      prevClicks = prevClicksData?.length ?? 0;
      prevConversions = prevConversionsData?.length ?? 0;
    }

    return NextResponse.json({
      daily,
      totals: {
        clicks: totalClicks,
        conversions: totalConversions,
        conversionRate:
          totalClicks > 0
            ? ((totalConversions / totalClicks) * 100).toFixed(1)
            : "0.0",
      },
      previousPeriod: {
        clicks: prevClicks,
        conversions: prevConversions,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
