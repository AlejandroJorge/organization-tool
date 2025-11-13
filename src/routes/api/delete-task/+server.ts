import { db } from "$lib/server/db";
import { tasks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const payload = (await request.json()) as { id?: string };
    const id = payload?.id?.trim();
    if (!id)
      return json({ message: "Task id is required" }, { status: 400 });

    await db.delete(tasks).where(eq(tasks.id, id));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[api] delete-task", error);
    return json({ message: "Unable to delete task" }, { status: 500 });
  }
};
