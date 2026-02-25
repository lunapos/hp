import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { name, phone, partner_type } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "名前を入力してください" },
        { status: 400 }
      );
    }

    const validTypes = ["individual", "corporation", "owner", "other"];
    if (partner_type && !validTypes.includes(partner_type)) {
      return NextResponse.json(
        { error: "無効なパートナー種別です" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("partners")
      .update({
        name: name.trim(),
        phone: phone || null,
        partner_type: partner_type || "individual",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "保存に失敗しました" },
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
