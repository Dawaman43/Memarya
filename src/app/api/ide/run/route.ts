import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, version = "latest", code, stdin = "" } = body ?? {};
    if (!language || !code)
      return NextResponse.json(
        { error: "language and code are required" },
        { status: 400 }
      );

    const pistonReq = {
      language,
      version,
      files: [{ name: `Main.${language}`, content: code }],
      stdin,
    };

    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pistonReq),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json({ result: data }, { status: res.ok ? 200 : 500 });
  } catch (e) {
    console.error("/api/ide/run error", e);
    return NextResponse.json({ error: "Failed to run" }, { status: 500 });
  }
}
