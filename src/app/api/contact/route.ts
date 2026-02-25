import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_ORIGINS = [
  "https://lp.lunapos.jp",
  "http://localhost:5173",
  "http://localhost:3000",
];

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json(null, { headers: corsHeaders(origin) });
}

interface ContactBody {
  companyName: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const body: ContactBody = await request.json();

    // Validate required fields
    if (!body.companyName || !body.name || !body.email) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400, headers }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "正しいメールアドレスを入力してください" },
        { status: 400, headers }
      );
    }

    // Send email via Resend
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "メール設定が完了していません" },
        { status: 500, headers }
      );
    }

    // 送信元フォームを判定
    const sourceLabel =
      origin === "https://lp.lunapos.jp"
        ? "LP（lp.lunapos.jp）"
        : "HP（lunapos.jp）";

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: emailError } = await resend.emails.send({
      from: "LunaPos <noreply@lunapos.jp>",
      to: ["contact@lunapos.jp"],
      replyTo: body.email,
      subject: `【お問い合わせ】${body.inquiryType} - ${body.companyName}`,
      text: [
        `送信元: ${sourceLabel}`,
        `お問い合わせ種別: ${body.inquiryType}`,
        `会社名/店舗名: ${body.companyName}`,
        `お名前: ${body.name}`,
        `メール: ${body.email}`,
        `電話: ${body.phone || "未入力"}`,
        "",
        "--- お問い合わせ内容 ---",
        body.message || "（未入力）",
      ].join("\n"),
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json(
        { error: "メール送信に失敗しました" },
        { status: 500, headers }
      );
    }

    // Track referral conversion if ref_code cookie exists
    try {
      const cookieStore = await cookies();
      const refCode = cookieStore.get("ref_code")?.value;

      if (refCode) {
        const supabase = await createClient();
        await supabase.rpc("track_conversion", {
          p_referral_code: refCode,
          p_store_name: body.companyName,
          p_store_email: body.email,
        });
      }
    } catch {
      // Conversion tracking failure should not block the contact form
    }

    return NextResponse.json({ success: true }, { headers });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500, headers }
    );
  }
}
