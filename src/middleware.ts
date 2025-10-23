import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  // Middleware runs only on matched routes (see matcher below)
  if (!session?.user) {
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set(
      "redirect",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect only these routes; add more patterns as needed
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};
