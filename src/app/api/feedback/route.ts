import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

interface FeedbackBody {
  storeName: string;
  role: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackBody = await request.json();

    if (!body.storeName || !body.message) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "メール設定が完了していません" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: emailError } = await resend.emails.send({
      from: "LunaPos <noreply@lunapos.jp>",
      to: ["contact@lunapos.jp"],
      subject: `【お客様の声】${body.storeName}`,
      text: [
        "お客様の声が届きました",
        "",
        `店舗名: ${body.storeName}`,
        `役職: ${body.role || "未入力"}`,
        "",
        "--- フィードバック内容 ---",
        body.message,
      ].join("\n"),
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json(
        { error: "メール送信に失敗しました" },
        { status: 500 }
      );
    }

    // inquiries insert（失敗してもメール送信の成功は返す）
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.from("inquiries").insert({
        project: "luna",
        type: "feedback",
        name: null,
        email: null,
        company: body.storeName,
        message: body.message,
        metadata: { role: body.role },
      });
    } catch {
      console.error("inquiries insert失敗（メール送信は成功）");
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
