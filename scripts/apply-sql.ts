import "dotenv/config";
import { readFileSync } from "node:fs";
import { Pool } from "pg";

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: tsx scripts/apply-sql.ts <path-to-sql>");
    process.exit(1);
  }
  const sql = readFileSync(file, "utf8");
  const client = new Pool({ connectionString: process.env.DATABASE_URL });
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    for (const stmt of statements) {
      await client.query(stmt);
      console.log(
        "Applied statement:",
        stmt.slice(0, 80).replace(/\s+/g, " ") + "..."
      );
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
