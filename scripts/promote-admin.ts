import "dotenv/config";
import { db } from "../src/db";
import { user } from "../auth-schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }
  const [updated] = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email))
    .returning();
  if (!updated) {
    console.error("User not found. Sign up first, then run again.");
    process.exit(2);
  }
  console.log(`Promoted ${email} to admin.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
