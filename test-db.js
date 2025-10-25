import { db } from "./src/db";
import { coursesTable } from "./src/db/schema";

async function testConnection() {
  try {
    const result = await db.select().from(coursesTable).limit(1);
    console.log("Database connection successful:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testConnection();
