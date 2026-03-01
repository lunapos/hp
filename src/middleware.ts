import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 0. i18n ルーティング（locale 判定・リダイレクト）
  const intlResponse = intlMiddleware(request);

  // Skip Supabase if not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"
  ) {
    return intlResponse;
  }

  // 1. Refresh Supabase auth session
  const { supabaseResponse, user } = await updateSession(request);

  // i18n で設定された cookie/header を Supabase response に引き継ぐ
  intlResponse.headers.forEach((value, key) => {
    supabaseResponse.headers.set(key, value);
  });

  // 2. Handle ?ref= referral code tracking
  const refCode = request.nextUrl.searchParams.get("ref");
  if (refCode) {
    // Persist ref code in cookie for 30 days
    supabaseResponse.cookies.set("ref_code", refCode, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    // Fire-and-forget: track the click via API route
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
    }).catch(() => {
      // Silently fail -- click tracking should never block page load
    });
  }

  // 3. Protect /partner/dashboard routes
  const pathname = request.nextUrl.pathname;
  // locale prefix を除去してパス判定
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
