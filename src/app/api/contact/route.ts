import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

interface ContactBody {
  companyName: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactBody = await request.json();

    // Validate required fields
    if (!body.companyName || !body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "正しいメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    // Log the contact form submission
    // TODO: Replace with Resend, Slack webhook, or Supabase integration
    console.log("=== お問い合わせ受信 ===");
    console.log(`会社名/店舗名: ${body.companyName}`);
    console.log(`名前: ${body.name}`);
    console.log(`メール: ${body.email}`);
    console.log(`電話: ${body.phone || "未入力"}`);
    console.log(`種別: ${body.inquiryType}`);
    console.log(`内容: ${body.message}`);
    console.log("========================");

    // Track referral conversion if ref_code cookie exists
    const cookieStore = await cookies();
    const refCode = cookieStore.get("ref_code")?.value;

    if (refCode) {
      try {
        const supabase = await createClient();
        await supabase.rpc("track_conversion", {
          p_referral_code: refCode,
          p_store_name: body.companyName,
          p_store_email: body.email,
        });
      } catch {
        // Conversion tracking failure should not block the contact form
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
