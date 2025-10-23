"use client";
import { useSession } from "@/lib/auth-client";

function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <div>
      <h1>Profile Page</h1>
      <p>Welcome to your profile!</p>
      {user && (
        <div>
          <h2>Your Information</h2>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <img
            src={user.image ?? ""}
            alt="User Image"
            width={100}
            height={100}
          />
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
