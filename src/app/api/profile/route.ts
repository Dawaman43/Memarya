import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
// Import the auth user table (better-auth schema) from project root
import { user as authUser } from "../../../../auth-schema";
import { auth } from "@/lib/auth";

type PatchBody = {
  name?: string;
  image?: string; // direct URL, e.g., from DiceBear
  avatarStyle?: string; // optional: e.g., "fun-emoji"
  avatarSeed?: string; // optional: e.g., user name
  bio?: string;
  location?: string;
  links?: string[] | { label?: string; url: string }[];
};

async function getSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as PatchBody;

    // Build updates
    let nextImage = body.image?.trim();
    if (!nextImage && body.avatarStyle && body.avatarSeed) {
      // Construct a DiceBear image URL (SVG by default)
      const style = encodeURIComponent(body.avatarStyle);
      const seed = encodeURIComponent(body.avatarSeed);
      nextImage = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    }

    const updates: {
      name?: string;
      image?: string | null;
      bio?: string | null;
      location?: string | null;
      links?: string | null;
    } = {};
    if (typeof body.name === "string" && body.name.trim().length) {
      updates.name = body.name.trim();
    }
    if (typeof nextImage === "string" && nextImage.length) {
      updates.image = nextImage;
    }
    if (typeof body.bio === "string") {
      updates.bio = body.bio.trim() || null;
    }
    if (typeof body.location === "string") {
      updates.location = body.location.trim() || null;
    }
    if (Array.isArray(body.links)) {
      try {
        const normalized = body.links
          .map((l) => {
            if (!l) return null;
            if (typeof l === "string") return { url: l };
            if (typeof l.url === "string" && l.url.trim())
              return { label: l.label?.trim() || undefined, url: l.url.trim() };
            return null;
          })
          .filter(Boolean);
        updates.links = JSON.stringify(normalized);
      } catch {
        // ignore malformed links
      }
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(authUser)
      .set(updates)
      .where(eq(authUser.id, sessionUser.id))
      .returning();

    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error("/api/profile PATCH error", e);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Convenience endpoint to fetch current user profile
  const sessionUser = await getSessionUser(req);
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch fresh copy from DB
  const rows = await db
    .select()
    .from(authUser)
    .where(eq(authUser.id, sessionUser.id));

  return NextResponse.json({ user: rows?.[0] ?? null });
}
