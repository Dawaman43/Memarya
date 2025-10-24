import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      language,
      version = "latest",
      code,
      stdin = "",
      files,
    } = body ?? {};

    // Validate inputs
    if (!language) {
      return NextResponse.json(
        { error: "Language is required" },
        { status: 400 }
      );
    }
    if (!code && (!Array.isArray(files) || !files.length)) {
      return NextResponse.json(
        { error: "Code or files are required" },
        { status: 400 }
      );
    }

    // Normalize language to match Piston
    const languageMap: Record<string, string> = {
      js: "javascript",
      python: "python",
      ts: "typescript",
      c: "c",
      cpp: "c++",
      java: "java",
      go: "go",
      rust: "rust",
    };
    const pistonLanguage =
      languageMap[language.toLowerCase()] || language.toLowerCase();

    // Fetch supported runtimes from Piston
    const runtimesRes = await fetch("https://emkc.org/api/v2/piston/runtimes", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!runtimesRes.ok) {
      console.error(
        `Failed to fetch Piston runtimes: ${runtimesRes.status} ${runtimesRes.statusText}`
      );
      return NextResponse.json(
        { error: "Failed to validate language/version" },
        { status: 500 }
      );
    }

    const runtimes = await runtimesRes.json();
    console.log("Piston runtimes:", runtimes);
    console.log("Requested language:", pistonLanguage, "version:", version);

    // Find runtime for the language
    const runtime = runtimes.find(
      (r: any) =>
        r.language === pistonLanguage || r.aliases.includes(pistonLanguage)
    );
    if (!runtime) {
      return NextResponse.json(
        {
          error: `Unsupported language: ${language} (mapped to ${pistonLanguage})`,
        },
        { status: 400 }
      );
    }

    // Validate version
    if (version !== "latest" && runtime.version !== version) {
      return NextResponse.json(
        {
          error: `Unsupported version: ${version} for ${language}. Available: ${runtime.version}`,
        },
        { status: 400 }
      );
    }

    // Prepare Piston request
    const pistonReq = {
      language: pistonLanguage,
      version,
      files:
        Array.isArray(files) && files.length
          ? files
          : [{ name: `main.${pistonLanguage}`, content: String(code ?? "") }],
      stdin,
      compile_timeout: 10000,
      run_timeout: 3000,
    };

    // Send request to Piston
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pistonReq),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Piston API error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to execute code" },
        { status: res.status }
      );
    }

    return NextResponse.json({ result: data }, { status: 200 });
  } catch (e) {
    console.error("/api/ide/run error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
