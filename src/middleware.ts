import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Avoid importing server-only modules (pg/drizzle) in Edge runtime.
  // Instead, call the Next API route handled by better-auth to get the session.
  // better-auth exposes `get-session` (seen 200 in logs); `session` returns 404
  const apiUrl = new URL("/api/auth/get-session", req.url);
  const res = await fetch(apiUrl, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  let hasUser = false;
  let role: string | null = null;
  if (res.ok) {
    try {
      const data = await res.json();
      hasUser = !!data?.user;
      role = data?.user?.role ?? null;
    } catch {
      hasUser = false;
    }
  }

  // Middleware runs only on matched routes (see matcher below)
  if (!hasUser) {
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set(
      "redirect",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only protection
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!hasUser) {
      const loginUrl = new URL("/auth", req.url);
      loginUrl.searchParams.set(
        "redirect",
        req.nextUrl.pathname + req.nextUrl.search
      );
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Protect only these routes; add more patterns as needed
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
