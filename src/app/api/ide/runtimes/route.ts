import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch("https://emkc.org/api/v2/piston/runtimes", {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(
      { runtimes: data },
      { status: res.ok ? 200 : 500 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch runtimes" },
      { status: 500 }
    );
  }
}
