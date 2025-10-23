"use client";
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

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";
  const avatarSrc =
    user.image ||
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(
      user.name || user.email || "User"
    )}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Page</h1>
        <Link href="/profile/edit">
          <Button>Edit Profile</Button>
        </Link>
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-20 w-20 mb-4">
            <AvatarImage src={avatarSrc} alt={user.name} />
            <AvatarFallback className="h-20 w-20 text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <Badge variant="secondary" className="mt-2">
            Verified User
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <CardDescription>Email Address</CardDescription>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
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
