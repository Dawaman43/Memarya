"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="text-muted-foreground">
          Please sign in to manage settings.
        </p>
      </div>
    );
  }

  async function onSaveEmail() {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/settings/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed");
      toast.success("Email updated. Please verify your new address.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Could not update email");
    } finally {
      setLoading(false);
    }
  }

  async function onSavePassword() {
    if (!oldPassword || !newPassword || newPassword.length < 8) {
      toast.error("Enter your current password and a new one (min 8 chars)");
      return;
    }
    setSavingPass(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed");
      toast.success("Password updated");
      setOldPassword("");
      setNewPassword("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    } finally {
      setSavingPass(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Link href="/profile">
          <Button variant="secondary">Back to Profile</Button>
        </Link>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>
            Update your sign-in email. We will require verification after
            change.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </CardContent>
        <CardFooter>
          <Button disabled={loading} onClick={onSaveEmail}>
            {loading ? "Saving..." : "Save Email"}
          </Button>
        </CardFooter>
      </Card>
      <Card className="max-w-xl mt-6">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="old">Current password</Label>
            <Input
              id="old"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={savingPass} onClick={onSavePassword}>
            {savingPass ? "Updating..." : "Update Password"}
          </Button>
        </CardFooter>
      </Card>
      <p className="text-xs text-muted-foreground mt-4">
        Note: Email verification sending isn’t wired here. You can integrate
        your email provider and verification flow using Better Auth’s
        verification APIs.
      </p>
    </div>
  );
}
