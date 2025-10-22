"use client";

import { useSession } from "@/lib/auth-client";
import Header from "./header";

export default function HeaderWrapper() {
  const { data: session } = useSession();

  const user = session?.user
    ? {
        ...session.user,
        image: session.user.image ?? undefined, // convert null → undefined
      }
    : undefined;

  return <Header user={user} />;
}
