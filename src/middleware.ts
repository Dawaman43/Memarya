import { NextResponse } from "next/server";

async function middleware() {
  return NextResponse.next();
}

export default middleware;
