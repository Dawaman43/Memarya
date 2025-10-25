#!/usr/bin/env tsx
import "dotenv/config";
import { db } from "@/db";
import { coursesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log(
      "Usage: npx tsx scripts/add-categories.ts Category1 Category2 'My Category, With, Commas'"
    );
    process.exit(1);
  }

  // Support comma-separated lists inside arguments
  const categories = args
    .flatMap((a) => a.split(","))
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.length > 64 ? s.slice(0, 64) : s));

  for (const category of categories) {
    try {
      const existing = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.category, category))
        .limit(1);

      if (existing.length) {
        console.log(`Skipping existing category: ${category}`);
        continue;
      }

      const [created] = await db
        .insert(coursesTable)
        .values({
          title: `Placeholder: ${category}`,
          description: null,
          thumbnailUrl: null,
          category,
        })
        .returning();

      console.log(
        `Inserted placeholder course for category '${category}' (id=${created.id})`
      );
    } catch (e) {
      console.error(`Failed to add category '${category}':`, e);
    }
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
