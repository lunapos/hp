import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
  partnerType: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterBody = await request.json();

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    if (body.password.length < 1) {
      return NextResponse.json(
        { error: "パスワードを入力してください" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "正しいメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "ユーザー作成に失敗しました" },
        { status: 500 }
      );
    }

    // 2. Generate referral code
    const { data: refCode } = await supabase.rpc("generate_referral_code");

    // 3. Create partner record
    const { error: partnerError } = await supabase.from("partners").insert({
      user_id: authData.user.id,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      partner_type: body.partnerType || "individual",
      referral_code: refCode,
    });

    if (partnerError) {
      return NextResponse.json(
        { error: "パートナー登録に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
