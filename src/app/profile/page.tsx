"use client";
import { useSession } from "@/lib/auth-client";

function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Profile Page</h1>
      <p>Welcome to your profile!</p>
    </div>
  );
}

export default ProfilePage;
