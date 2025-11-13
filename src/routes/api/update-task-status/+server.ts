import { db } from "$lib/server/db";
import { tasks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { id, value }: { id?: string; value?: boolean } = await request.json();
    if (!id || typeof value !== "boolean")
      return json({ message: "Invalid payload" }, { status: 400 });

    await db.update(tasks).set({ status: value }).where(eq(tasks.id, id));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[api] update-task-status", error);
    return json({ message: "Unable to update task" }, { status: 500 });
  }
};
