import "dotenv/config";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

async function main() {
  const srcRelative = process.argv[2] || "course/robotnotes.pdf";
  const srcPath = path.join(process.cwd(), srcRelative);
  if (!fs.existsSync(srcPath)) {
    console.error("Source file not found:", srcPath);
    process.exit(1);
  }

  const publicDir = path.join(process.cwd(), "public", "courses");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const timestamp = Date.now();
  const baseName = path.basename(srcPath, path.extname(srcPath));
  const destFileName = `${baseName}-${timestamp}${path.extname(srcPath)}`;
  const destPath = path.join(publicDir, destFileName);

  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${srcPath} -> ${destPath}`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const publicUrl = `/courses/${destFileName}`;
    const title =
      process.argv[3] ||
      baseName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const description = `Imported from ${srcRelative}`;

    const res = await client.query(
      'insert into "courses" ("title", "description", "thumbnailUrl") values ($1,$2,$3) returning id',
      [title, description, publicUrl]
    );
    const id = res.rows[0]?.id;
    console.log("Inserted course id:", id);
    console.log("Public file available at:", publicUrl);
  } catch (err) {
    console.error("DB insert error:", err);
    process.exit(2);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
