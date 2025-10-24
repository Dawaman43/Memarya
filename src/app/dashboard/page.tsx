import { db } from "@/db";
import { enrollmentsTable, coursesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { headers as nextHeaders } from "next/headers";

export default async function DashboardPage() {
  const rawHeaders =
    (await (nextHeaders() as unknown as Promise<Headers>)) as unknown as Headers;
  const session = await auth.api.getSession({
    headers: new Headers(rawHeaders),
  });
  const user = session?.user as { id: string } | undefined;
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <p>Please sign in.</p>
      </div>
    );
  }

  const enrollments = await db
    .select({
      id: enrollmentsTable.id,
      progress: enrollmentsTable.progress,
      courseId: enrollmentsTable.courseId,
      title: coursesTable.title,
    })
    .from(enrollmentsTable)
    .leftJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(eq(enrollmentsTable.userId, user.id));

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Your learning</h1>
      <ul className="space-y-2">
        {enrollments.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between border rounded-md p-3"
          >
            <div>
              <div className="font-medium">{e.title}</div>
              <div className="text-sm text-muted-foreground">
                Progress: {e.progress}%
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {e.progress === 100 && (
                <a
                  className="underline"
                  href={`/api/certificates/${e.courseId}/pdf`}
                >
                  Download Certificate
                </a>
              )}
              <Link className="underline" href={`/courses/${e.courseId}`}>
                Open
              </Link>
            </div>
          </li>
        ))}
        {!enrollments.length && (
          <p className="text-sm text-muted-foreground">No enrollments yet.</p>
        )}
      </ul>
    </div>
  );
}
