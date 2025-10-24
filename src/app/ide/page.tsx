"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  loading: () => <div>Loading editor...</div>,
}) as unknown as React.ComponentType<EditorProps>;

const LANG_SNIPPETS: Record<string, string> = {
  js: "console.log('Hello, world!')",
  python: "print('Hello, world!')",
  ts: "function main(){console.log('Hello, TS')}\nmain()",
  c: '#include <stdio.h>\nint main(){printf("Hello, C\\n");return 0;}',
  cpp: '#include <iostream>\nint main(){std::cout<<"Hello, C++\\n";return 0;}',
  java: 'class Main{public static void main(String[] args){System.out.println("Hello, Java");}}',
  go: 'package main\nimport "fmt"\nfunc main(){fmt.Println("Hello, Go")}',
  rust: 'fn main(){ println!("Hello, Rust"); }',
};

const LANGUAGE_VERSIONS: Record<string, string> = {
  js: "18.15.0", // Node runtime
  python: "3.10.0",
  ts: "5.0.3", // Node runtime
  c: "10.2.0",
  cpp: "10.2.0",
  java: "15.0.2",
  go: "1.16.2",
  rust: "1.68.2",
};

// Map Piston language names to display names
const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  js: "JavaScript",
  python: "Python",
  ts: "TypeScript",
  c: "C",
  cpp: "C++",
  java: "Java",
  go: "Go",
  rust: "Rust",
};

// Map Piston language names to Monaco Editor language identifiers
const MONACO_LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  python: "python",
  ts: "typescript",
  c: "c",
  cpp: "cpp",
  java: "java",
  go: "go",
  rust: "rust",
};

const LANGUAGE_OPTIONS = Object.keys(LANG_SNIPPETS);

export default function IDEPage() {
  const [language, setLanguage] = useState<string>("js");
  const [code, setCode] = useState<string>(LANG_SNIPPETS["js"]);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [version, setVersion] = useState<string>(LANGUAGE_VERSIONS["js"]);
  const [title, setTitle] = useState<string>("");
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);

  function onLangChange(l: string) {
    setLanguage(l);
    setCode(LANG_SNIPPETS[l] || "");
    setVersion(LANGUAGE_VERSIONS[l] || "latest");
  }

  async function run() {
    if (!code.trim()) {
      setOutput("Error: No code to execute.");
      return;
    }

    setRunning(true);
    setOutput("Running...");

    try {
      const res = await fetch("/api/ide/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, version, code, stdin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP error: ${res.status}`);
      }

      if (data?.result) {
        const { run, compile } = data.result;
        const out = [compile?.stdout, compile?.stderr, run?.stdout, run?.stderr]
          .filter(Boolean)
          .join("\n")
          .trim();
        setOutput(out || "(no output)");
      } else {
        setOutput(data.error || "No result returned from server.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOutput(`Error: ${msg}`);
    } finally {
      setRunning(false);
    }
  }

  async function saveSnippet(publicShare = false) {
    if (!code.trim()) {
      setOutput("Error: No code to save.");
      return;
    }

    const payload = {
      title:
        title || `Untitled ${LANGUAGE_DISPLAY_NAMES[language] || language}`,
      language,
      version,
      files: files.length
        ? files
        : [{ name: `main.${language}`, content: code }],
      isPublic: publicShare,
    };

    try {
      const res = await fetch("/api/ide/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (publicShare && data?.snippet?.shareId) {
          const url = `${location.origin}/api/ide/snippets/${data.snippet.shareId}`;
          setOutput(`Saved and shareable at:\n${url}`);
        } else {
          setOutput("Saved snippet.");
        }
      } else {
        setOutput(data?.error || "Failed to save.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOutput(`Error: ${msg}`);
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
                  {LANGUAGE_DISPLAY_NAMES[l] || l}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="ver">Version</Label>
            <Input
              id="ver"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-40"
              placeholder="e.g., latest"
            />
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-64"
              placeholder="Snippet title"
            />
          </div>
          <div className="border rounded-md overflow-hidden">
            <MonacoEditor
              height="50vh"
              language={MONACO_LANGUAGE_MAP[language] || language}
              theme="vs-dark"
              value={code}
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
            <Button variant="secondary" onClick={() => saveSnippet(false)}>
              Save
            </Button>
            <Button variant="secondary" onClick={() => saveSnippet(true)}>
              Save & Share
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
            {output || "Click 'Run' to execute your code."}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
