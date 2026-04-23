import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { cast_id, email, password, tenant_id } = await req.json();

    // バリデーション
    if (!cast_id || typeof cast_id !== "string") {
      return new Response(
        JSON.stringify({ error: "キャストIDは必須です" }),
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
    if (!tenant_id || typeof tenant_id !== "string") {
      return new Response(
        JSON.stringify({ error: "テナントIDは必須です" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // service_role でDB操作（RLSバイパス）
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // キャストが存在するか確認
    const { data: cast, error: castError } = await supabase
      .from("casts")
      .select("id, stage_name, tenant_id")
      .eq("id", cast_id)
      .eq("tenant_id", tenant_id)
      .single();

    if (castError || !cast) {
      return new Response(
        JSON.stringify({ error: "キャストが見つかりません" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Auth ユーザーを作成（tenant_id + cast_id をメタデータに埋め込み）
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: {
        tenant_id: tenant_id,
        cast_id: cast_id,
        role: "cast",
      },
    });

    if (authError || !authData.user) {
      console.error("ユーザー作成エラー:", authError);

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

    // casts テーブルに auth_user_id を紐づけ
    await supabase
      .from("casts")
      .update({ auth_user_id: authData.user.id })
      .eq("id", cast_id)
      .eq("tenant_id", tenant_id);

    return new Response(
      JSON.stringify({
        user_id: authData.user.id,
        email: authData.user.email,
        cast_id: cast_id,
        stage_name: cast.stage_name,
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
