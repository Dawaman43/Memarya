"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type EditorProps = {
  height?: string | number;
  language?: string;
  theme?: string;
  value?: string;
  onChange?: (v?: string) => void;
  options?: unknown;
};
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as unknown as React.ComponentType<EditorProps>;

const LANG_SNIPPETS: Record<string, string> = {
  javascript: "console.log('Hello, world!')",
  python: "print('Hello, world!')",
  typescript: "function main(){console.log('Hello, TS')}\nmain()",
  c: '#include <stdio.h>\nint main(){printf("Hello, C\\n");return 0;}',
  cpp: '#include <iostream>\nint main(){std::cout<<"Hello, C++\\n";return 0;}',
  java: 'class Main{public static void main(String[]a){System.out.println("Hello, Java");}}',
  go: 'package main\nimport "fmt"\nfunc main(){fmt.Println("Hello, Go")}',
  rust: 'fn main(){ println!("Hello, Rust"); }',
};

const LANGUAGE_OPTIONS = Object.keys(LANG_SNIPPETS);

export default function IDEPage() {
  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>(LANG_SNIPPETS["javascript"]);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);

  function onLangChange(l: string) {
    setLanguage(l);
    setCode(LANG_SNIPPETS[l] || "");
  }

  async function run() {
    setRunning(true);
    setOutput("");
    try {
      const res = await fetch("/api/ide/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin }),
      });
      const data = await res.json();
      if (data?.result) {
        const { run, compile } = data.result;
        const out = [compile?.stdout, compile?.stderr, run?.stdout, run?.stderr]
          .filter(Boolean)
          .join("\n")
          .trim();
        setOutput(out || "(no output)");
      } else {
        setOutput(data?.error || "Run failed");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOutput(msg);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Online IDE</h1>

      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <Label htmlFor="lang">Language</Label>
            <div className="flex gap-2 flex-wrap">
              {LANGUAGE_OPTIONS.map((l) => (
                <Button
                  key={l}
                  variant={l === language ? "default" : "secondary"}
                  size="sm"
                  onClick={() => onLangChange(l)}
                >
                  {l}
                </Button>
              ))}
            </div>
          </div>
          <div className="border rounded-md overflow-hidden">
            <MonacoEditor
              height="50vh"
              language={language === "cpp" ? "cpp" : language}
              theme="vs-dark"
              value={code}
              // monaco onChange passes value: string | undefined
              onChange={(v: string | undefined) => setCode(v || "")}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stdin">STDIN</Label>
            <Textarea
              id="stdin"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Optional input passed to your program"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={run} disabled={running}>
              {running ? "Running…" : "Run"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-black text-white p-3 rounded-md whitespace-pre-wrap text-sm min-h-[120px]">
            {output}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
