import { db } from "$lib/server/db";
import { tasks } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId)
      return json({ message: "Unauthorized" }, { status: 401 });

    const payload = (await request.json()) as { id?: string };
    const id = payload?.id?.trim();
    if (!id)
      return json({ message: "Task id is required" }, { status: 400 });

    const [taskRecord] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .limit(1);
    if (!taskRecord)
      return json({ message: "Task not found" }, { status: 404 });

    await db.delete(tasks).where(eq(tasks.id, taskRecord.id));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[api] delete-task", error);
    return json({ message: "Unable to delete task" }, { status: 500 });
  }
};
