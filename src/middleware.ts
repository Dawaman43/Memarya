import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const { pathname } = req.nextUrl;

  const protectedPaths = ["/dashboard", "/profile", "/settings"];

  return NextResponse.next();
}

export default middleware;
