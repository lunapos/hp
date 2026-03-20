import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ランダムなデバイストークンを生成（8文字の英数字）
function generateDeviceToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const parts = [
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
  ];
  return `luna-${parts[0]}-${parts[1]}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { store_name, email, password } = await req.json();

    // バリデーション
    if (!store_name || typeof store_name !== "string" || !store_name.trim()) {
      return new Response(
        JSON.stringify({ error: "店舗名は必須です" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "メールアドレスは必須です" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return new Response(
        JSON.stringify({ error: "パスワードは6文字以上で入力してください" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // service_role でDB操作（RLSバイパス）
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. 店舗を作成
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .insert({ name: store_name.trim() })
      .select("id")
      .single();

    if (storeError || !store) {
      console.error("店舗作成エラー:", storeError);
      return new Response(
        JSON.stringify({ error: "店舗の作成に失敗しました" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tenantId = store.id;

    // 2. デバイストークンを発行
    const deviceToken = generateDeviceToken();
    const { error: deviceError } = await supabase
      .from("devices")
      .insert({
        tenant_id: tenantId,
        device_name: "iPad",
        device_token: deviceToken,
        role: "floor",
      });

    if (deviceError) {
      // 店舗は作成済みだがデバイス失敗 → クリーンアップ
      console.error("デバイス作成エラー:", deviceError);
      await supabase.from("stores").delete().eq("id", tenantId);
      return new Response(
        JSON.stringify({ error: "デバイスの作成に失敗しました" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Auth ユーザーを作成（tenant_id をメタデータに埋め込み）
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { tenant_id: tenantId },
    });

    if (authError || !authData.user) {
      // クリーンアップ
      console.error("ユーザー作成エラー:", authError);
      await supabase.from("devices").delete().eq("tenant_id", tenantId);
      await supabase.from("stores").delete().eq("id", tenantId);

      // メール重複の場合は分かりやすいメッセージ
      if (authError?.message?.includes("already been registered") || authError?.message?.includes("already exists")) {
        return new Response(
          JSON.stringify({ error: "このメールアドレスは既に登録されています" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: "アカウントの作成に失敗しました" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4. デフォルトのルームを1つ作成（初回ログイン時にすぐ使える状態に）
    await supabase.from("rooms").insert({
      tenant_id: tenantId,
      name: "メインフロア",
      sort_order: 1,
    });

    return new Response(
      JSON.stringify({
        tenant_id: tenantId,
        device_token: deviceToken,
        email: authData.user.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("サーバーエラー:", err);
    return new Response(
      JSON.stringify({ error: "サーバーエラーが発生しました" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
