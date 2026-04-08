import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { device_token } = await req.json();

    if (!device_token || typeof device_token !== "string") {
      return new Response(
        JSON.stringify({ error: "device_token は必須です" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // service_role でデバイス検索（RLSバイパス）
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: device, error } = await supabase
      .from("devices")
      .select("id, tenant_id, device_name, role")
      .eq("device_token", device_token)
      .eq("is_active", true)
      .single();

    if (error || !device) {
      return new Response(
        JSON.stringify({ error: "無効なデバイストークンです" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // last_seen_at を更新
    await supabase
      .from("devices")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", device.id);

    // tenant_id 入り JWT を発行（有効期限 30日）
    // SUPABASE_ プレフィックスは予約済みのため JWT_SECRET を使用
    const jwtSecret = Deno.env.get("JWT_SECRET")!;
    const key = new TextEncoder().encode(jwtSecret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const now = Math.floor(Date.now() / 1000);
    const jwt = await create(
      { alg: "HS256", typ: "JWT" },
      {
        iss: "supabase",
        ref: Deno.env.get("SUPABASE_URL")!.split("//")[1].split(".")[0],
        role: "authenticated",
        tenant_id: device.tenant_id,
        device_id: device.id,
        iat: now,
        exp: getNumericDate(60 * 60 * 24 * 30), // 30日
      },
      cryptoKey,
    );

    return new Response(
      JSON.stringify({
        access_token: jwt,
        tenant_id: device.tenant_id,
        device_id: device.id,
        device_name: device.device_name,
        role: device.role,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "サーバーエラー" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
