import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Skip if Supabase is not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"
  ) {
    return NextResponse.next();
  }

  // 1. Refresh Supabase auth session
  const { supabaseResponse, user } = await updateSession(request);

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
  if (request.nextUrl.pathname.startsWith("/partner/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/partner/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Redirect logged-in users away from login page
  if (request.nextUrl.pathname === "/partner/login" && user) {
    return NextResponse.redirect(new URL("/partner/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
