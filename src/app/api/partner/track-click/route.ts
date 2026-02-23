import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.referral_code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const supabase = await createClient();

    // Use RPC to safely track click without exposing partners table
    await supabase.rpc("track_referral_click", {
      p_referral_code: body.referral_code,
      p_ip_address: body.ip_address || null,
      p_user_agent: body.user_agent || null,
      p_page_url: body.page_url || null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
