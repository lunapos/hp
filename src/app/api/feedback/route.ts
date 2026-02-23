import { NextRequest, NextResponse } from "next/server";

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

    // TODO: Replace with DB or Slack webhook
    console.log("=== お客様の声 受信 ===");
    console.log(`店舗名: ${body.storeName}`);
    console.log(`役職: ${body.role || "未入力"}`);
    console.log(`内容: ${body.message}`);
    console.log("========================");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
