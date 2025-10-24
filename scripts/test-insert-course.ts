import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const base64 = "data:image/png;base64," + "a".repeat(5000);
    const { rows } = await client.query(
      'insert into "courses" ("title", "description", "thumbnailUrl") values ($1, $2, $3) returning id',
      ["Test Large Thumb", "dummy", base64]
    );
    const id = rows[0]?.id;
    console.log("Inserted course id:", id);
    // Clean up
    await client.query('delete from "courses" where id = $1', [id]);
    console.log("Cleanup done");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("Test insert failed:", e);
  process.exit(1);
});
