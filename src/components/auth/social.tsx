"use client";
import { FcGoogle } from "react-icons/fc";
import { BsGithub, BsLinkedin, BsTwitterX } from "react-icons/bs";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
function SocialAuth() {
  const [loading, setLoading] = useState(false);

  async function handleSocialSignIn({
    socialProvider,
  }: {
    socialProvider: "google" | "github" | "linkedin" | "twitter";
  }) {
    try {
      setLoading(true);
      await authClient.signIn.social({
        provider: socialProvider,
      });
      toast.success(`Redirecting to ${socialProvider} for sign-in...`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error ?? "Unknown error");
      toast.error(`Sign-in failed: ${message}`);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <div className="flex items-center gap-3 py-1 mt-2">
        <span className="h-px bg-border flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px bg-border flex-1" />
      </div>

      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => handleSocialSignIn({ socialProvider: "google" })}
        >
          <FcGoogle />
        </Button>

        <Button
          variant="outline"
          type="button"
          onClick={() => handleSocialSignIn({ socialProvider: "github" })}
        >
          <BsGithub />
        </Button>

        <Button
          variant="outline"
          type="button"
          onClick={() => handleSocialSignIn({ socialProvider: "linkedin" })}
        >
          <BsLinkedin />
        </Button>

        <Button
          variant="outline"
          type="button"
          onClick={() => handleSocialSignIn({ socialProvider: "twitter" })}
        >
          <BsTwitterX />
        </Button>
      </div>
    </div>
  );
}

export default SocialAuth;
