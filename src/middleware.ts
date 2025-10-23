import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const { pathname } = req.nextUrl;

  const protectedPaths = ["/dashboard", "/profile", "/settings"];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !session?.user) {
    const loginUrl = new URL("/auth", req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};
