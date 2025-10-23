"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

const DICEBEAR_STYLES = [
  "fun-emoji",
  "adventurer",
  "avataaars",
  "bottts",
  "identicon",
  "shapes",
  "pixel-art",
  "notionists",
];

function dicebearUrl(
  style: string,
  seed: string,
  opts?: { bg?: string; transparent?: boolean; size?: number }
) {
  const s = encodeURIComponent(style);
  const q = encodeURIComponent(seed || "User");
  const params = new URLSearchParams({ seed: q });
  if (opts?.size) params.set("size", String(opts.size));
  if (opts?.transparent) {
    // transparent background by default; do nothing
  } else if (opts?.bg) {
    // DiceBear expects hex without '#'
    const color = opts.bg.replace(/^#/, "");
    params.set("backgroundType", "solid");
    params.set("backgroundColor", color);
  }
  return `https://api.dicebear.com/7.x/${s}/svg?${params.toString()}`;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [name, setName] = useState<string>("");
  const [style, setStyle] = useState<string>(DICEBEAR_STYLES[0]);
  const [seed, setSeed] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [links, setLinks] = useState<string[]>([""]); // simple list of URLs
  // Avatar controls
  const [bgColor, setBgColor] = useState<string>("");
  const [transparentBg, setTransparentBg] = useState<boolean>(true);
  const [size, setSize] = useState<number>(128);
  const initials = useMemo(() => {
    const base = name || user?.name || "?";
    return base
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [name, user?.name]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      const defaultSeed = user.name || user.email || "User";
      setSeed(defaultSeed);
      setSelectedImage(
        user.image || dicebearUrl(DICEBEAR_STYLES[0], defaultSeed, { size })
      );
      // Try to prefill extra fields from API
      fetch("/api/profile")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const u = data?.user;
          if (u) {
            setBio(u.bio || "");
            setLocation(u.location || "");
            try {
              const parsed = u.links ? JSON.parse(u.links) : [];
              if (Array.isArray(parsed)) {
                const urls = parsed
                  .map((x: any) => (typeof x === "string" ? x : x?.url))
                  .filter((x: any) => typeof x === "string") as string[];
                setLinks(urls.length ? urls : [""]);
              }
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [user, size]);

  const samples = useMemo(() => {
    const base = seed || "User";
    return Array.from({ length: 8 }).map((_, i) => {
      const sampleSeed = `${base}-${i + 1}`;
      return {
        seed: sampleSeed,
        url: dicebearUrl(style, sampleSeed, {
          bg: bgColor,
          transparent: transparentBg,
          size,
        }),
      };
    });
  }, [style, seed, bgColor, transparentBg, size]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>
        <p className="text-muted-foreground mb-4">
          Please sign in to edit your profile.
        </p>
        <Link href="/auth">
          <Button>Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  async function onSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter your name");
      return;
    }
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          image: selectedImage,
          bio,
          location,
          links: links.filter((l) => l && l.trim().length),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Profile updated");
      // Optimistic: refresh current route and profile page
      router.refresh();
      router.push("/profile");
    } catch (e) {
      toast.error("Could not update profile");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <div className="space-x-2">
          <Link href="/profile">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button onClick={onSave}>Save Changes</Button>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
          <CardDescription>
            Update your profile info and choose a free avatar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-[240px_1fr] items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={selectedImage} alt={name || user.name} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">Preview</div>
            </div>
            <div className="space-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you based?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label>Links</Label>
                <div className="space-y-2">
                  {links.map((l, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={l}
                        onChange={(e) => {
                          const copy = [...links];
                          copy[idx] = e.target.value;
                          setLinks(copy);
                        }}
                        placeholder="https://..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setLinks(links.filter((_, i) => i !== idx))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setLinks((prev) => [...prev, ""])}
                  >
                    Add link
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Avatar style</Label>
                <Tabs value={style} onValueChange={setStyle} className="w-full">
                  <TabsList className="flex flex-wrap">
                    {DICEBEAR_STYLES.map((s) => (
                      <TabsTrigger key={s} value={s} className="capitalize">
                        {s.replace("-", " ")}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {DICEBEAR_STYLES.map((s) => (
                    <TabsContent key={s} value={s} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`seed-${s}`}>Avatar seed</Label>
                          <Input
                            id={`seed-${s}`}
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            placeholder="Type any word to generate"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`size-${s}`}>Size</Label>
                          <Input
                            id={`size-${s}`}
                            type="number"
                            min={64}
                            max={256}
                            value={size}
                            onChange={(e) =>
                              setSize(Number(e.target.value) || 128)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`bg-${s}`}>Background color</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id={`bg-${s}`}
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              placeholder="e.g. ffe08a or #ffe08a"
                              disabled={transparentBg}
                            />
                            <Button
                              type="button"
                              variant={transparentBg ? "secondary" : "outline"}
                              onClick={() => setTransparentBg(!transparentBg)}
                            >
                              {transparentBg ? "Transparent" : "Solid"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {samples.map(({ seed: sd, url }) => (
                          <button
                            type="button"
                            key={sd}
                            className={`border rounded-md p-2 hover:bg-accent ${
                              selectedImage === url ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedImage(url)}
                            title={sd}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={sd} className="w-full h-auto" />
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setSelectedImage(
                              dicebearUrl(s, seed || "User", {
                                bg: bgColor,
                                transparent: transparentBg,
                                size,
                              })
                            )
                          }
                        >
                          Use this style
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setSeed(
                              `${seed || "User"}-${Math.floor(
                                Math.random() * 1000
                              )}`
                            )
                          }
                        >
                          Randomize seed
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Link href="/profile">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button onClick={onSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
