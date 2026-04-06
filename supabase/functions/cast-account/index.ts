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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET: キャストIDに紐づくメールアドレスを取得
    if (req.method === "GET" && action === "get-email") {
      const castId = url.searchParams.get("cast_id");
      const tenantId = url.searchParams.get("tenant_id");
      if (!castId || !tenantId) {
        return new Response(JSON.stringify({ error: "パラメータ不足" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // auth.usersからcast_idが一致するユーザーを検索
      const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;
      const user = users.find(u =>
        u.user_metadata?.cast_id === castId &&
        u.user_metadata?.tenant_id === tenantId
      );
      return new Response(JSON.stringify({ email: user?.email ?? null, user_id: user?.id ?? null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: メールアドレス更新
    if (req.method === "POST" && action === "update-email") {
      const { cast_id, tenant_id, email } = await req.json();
      if (!cast_id || !tenant_id || !email) {
        return new Response(JSON.stringify({ error: "パラメータ不足" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (listError) throw listError;
      const user = users.find(u =>
        u.user_metadata?.cast_id === cast_id &&
        u.user_metadata?.tenant_id === tenant_id
      );
      if (!user) {
        return new Response(JSON.stringify({ error: "アカウントが見つかりません" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email: email.trim(),
      });
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "不正なリクエスト" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "サーバーエラー" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
