"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data?.user || null))
      .catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Profile Page</h1>
        <p className="text-muted-foreground">
          Please sign in to view your profile.
        </p>
      </div>
    );
  }

  const initials =
    profile?.name || user.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";
  const avatarSrc =
    profile?.image ||
    user.image ||
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(
      profile?.name || user.name || user.email || "User"
    )}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Page</h1>
        <Link href="/profile/edit">
          <Button>Edit Profile</Button>
        </Link>
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-20 w-20 mb-4">
            <AvatarImage src={avatarSrc} alt={profile?.name || user.name} />
            <AvatarFallback className="h-20 w-20 text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">
            {profile?.name || user.name}
          </CardTitle>
          <Badge variant="secondary" className="mt-2">
            Verified User
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="space-y-1">
            <CardDescription>Email Address</CardDescription>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
          {profile?.location && (
            <div className="space-y-1">
              <CardDescription>Location</CardDescription>
              <p className="text-sm font-medium">{profile.location}</p>
            </div>
          )}
          {profile?.bio && (
            <div className="space-y-1">
              <CardDescription>Bio</CardDescription>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}
          {profile?.links && (
            <div className="space-y-1">
              <CardDescription>Links</CardDescription>
              <ul className="list-disc pl-6 text-sm">
                {(() => {
                  try {
                    const parsed = JSON.parse(profile.links);
                    return Array.isArray(parsed) ? parsed : [];
                  } catch {
                    return [];
                  }
                })().map((l: any, idx: number) => {
                  const href = typeof l === "string" ? l : l?.url;
                  const label = typeof l === "string" ? l : l?.label || l?.url;
                  if (!href) return null;
                  return (
                    <li key={idx}>
                      <a
                        className="text-primary hover:underline"
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="space-y-1">
            <CardDescription>Account Status</CardDescription>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
