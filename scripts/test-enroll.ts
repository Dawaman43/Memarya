import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const { rows: userRows } = await client.query(
      'select id from "user" limit 1'
    );
    if (!userRows.length) throw new Error("No users in auth user table");
    const userId: string = userRows[0].id;

    const { rows: courseRows } = await client.query(
      'insert into "courses" ("title") values ($1) returning id',
      ["Enroll Test Course"]
    );
    const courseId: number = courseRows[0].id;

    // check existing
    const { rows: existing } = await client.query(
      'select * from "enrollments" where "userId" = $1 and "courseId" = $2',
      [userId, courseId]
    );
    console.log("Existing rows before insert:", existing.length);

    if (!existing.length) {
      await client.query(
        'insert into "enrollments" ("userId", "courseId") values ($1, $2)',
        [userId, courseId]
      );
    }

    const { rows: after } = await client.query(
      'select * from "enrollments" where "userId" = $1 and "courseId" = $2',
      [userId, courseId]
    );
    console.log("Rows after insert:", after.length);

    // cleanup
    await client.query('delete from "enrollments" where "courseId" = $1', [
      courseId,
    ]);
    await client.query('delete from "courses" where id = $1', [courseId]);
    console.log("Cleanup done");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
