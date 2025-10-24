import { test, expect } from "@playwright/test";

// Basic API test to ensure admin endpoints require auth

test("admin list courses requires auth", async ({ request }) => {
  const res = await request.get("/api/admin/courses");
  expect(res.status()).toBe(403);
});

test("public courses list works", async ({ request }) => {
  const res = await request.get("/api/courses");
  expect(res.status()).toBe(200);
});
