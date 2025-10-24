// scripts/seed-admin.ts
import "dotenv/config";
import { db } from "../src/db";
import * as auth from "../auth-schema";
import { randomUUID } from "crypto";
import { hash as argon2Hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

async function main() {
  const email = "dawitworkujima@gmail.com";
  const password = "12345678";

  const hashedPassword = await argon2Hash(password, {
    // https://github.com/TheUnderScorer/better-auth/blob/main/src/auth/utils/password.ts#L5
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // 1️⃣ Remove all old admin accounts
  const admins = await db
    .select()
    .from(auth.user)
    .where(eq(auth.user.role, "admin"));

  for (const admin of admins) {
    await db.delete(auth.account).where(eq(auth.account.userId, admin.id));
    await db.delete(auth.user).where(eq(auth.user.id, admin.id));
  }
  console.log(`✅ Removed ${admins.length} old admin(s)`);

  // 2️⃣ Create new admin user
  const userId = randomUUID();
  await db.insert(auth.user).values({
    id: userId,
    name: "Admin",
    email,
    emailVerified: true,
    role: "admin",
  });

  // 3️⃣ Insert credentials account with correct hash
  await db.insert(auth.account).values({
    id: randomUUID(),
    userId,
    providerId: "credential",
    accountId: email,
    password: hashedPassword,
    type: "email",
  });

  console.log(`✅ Created new admin ${email} with password '${password}'`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
