import { NextResponse, NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 0. i18n ルーティング（locale 判定・リダイレクト・リライト）
  const intlResponse = intlMiddleware(request);

  // intl がリダイレクト（3xx）を返した場合はそのまま返す
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Skip Supabase if not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"
  ) {
    return intlResponse;
  }

  // 1. intl のリライト先 URL を反映して Supabase セッションを更新
  //    as-needed モードでは / → /ja への内部リライトが行われる
  //    この rewrite を supabaseResponse にも引き継がないと 404 になる
  const rewriteUrl = intlResponse.headers.get("x-middleware-rewrite");
  const effectiveRequest = rewriteUrl
    ? new NextRequest(rewriteUrl, request)
    : request;

  const { supabaseResponse, user } = await updateSession(effectiveRequest);

  // intl で設定された header を引き継ぐ
  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "x-middleware-rewrite") {
      supabaseResponse.headers.set(key, value);
    }
  });
  // intl の cookie を引き継ぐ
  for (const cookie of intlResponse.cookies.getAll()) {
    supabaseResponse.cookies.set(cookie.name, cookie.value, cookie);
  }
  // リライト先を supabaseResponse にも設定
  if (rewriteUrl) {
    supabaseResponse.headers.set("x-middleware-rewrite", rewriteUrl);
  }

  // 2. Handle ?ref= referral code tracking
  const refCode = request.nextUrl.searchParams.get("ref");
  if (refCode) {
    supabaseResponse.cookies.set("ref_code", refCode, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    const trackUrl = new URL("/api/partner/track-click", request.url);
    fetch(trackUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referral_code: refCode,
        ip_address: request.headers.get("x-forwarded-for") || "",
        user_agent: request.headers.get("user-agent") || "",
        page_url: request.nextUrl.pathname,
      }),
    }).catch(() => {});
  }

  // 3. Protect /partner/dashboard routes
  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = pathname.replace(/^\/(en|zh)/, "");

  if (pathWithoutLocale.startsWith("/partner/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/partner/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Redirect logged-in users away from login page
  if (pathWithoutLocale === "/partner/login" && user) {
    return NextResponse.redirect(new URL("/partner/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
