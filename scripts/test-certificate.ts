import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    // Get first user
    const { rows: userRows } = await client.query(
      'select id, name, email from "user" limit 1'
    );
    if (!userRows.length) throw new Error("No users in auth user table");
    const user = userRows[0];
    console.log("Using user:", user);

    // Create test course
    const { rows: courseRows } = await client.query(
      'insert into "courses" ("title", "description") values ($1, $2) returning id',
      ["Certificate Test Course", "A test course for certificate generation"]
    );
    const courseId: number = courseRows[0].id;
    console.log("Created course with ID:", courseId);

    // Create enrollment with 100% progress
    const { rows: existing } = await client.query(
      'select * from "enrollments" where "userId" = $1 and "courseId" = $2',
      [user.id, courseId]
    );

    if (!existing.length) {
      await client.query(
        'insert into "enrollments" ("userId", "courseId", "progress") values ($1, $2, $3)',
        [user.id, courseId, 100]
      );
      console.log("Created enrollment with 100% progress");
    } else {
      await client.query(
        'update "enrollments" set "progress" = $1 where "userId" = $2 and "courseId" = $3',
        [100, user.id, courseId]
      );
      console.log("Updated enrollment to 100% progress");
    }

    console.log("Test data ready!");
    console.log("User ID:", user.id);
    console.log("Course ID:", courseId);
    console.log(
      "Test URL: http://localhost:3004/api/certificates/" + courseId + "/pdf"
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
