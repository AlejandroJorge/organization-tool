import { db } from "$lib/server/db";
import { and, eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";
import { notes } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId)
      return json({ message: "Unauthorized" }, { status: 401 });

    const payload = (await request.json()) as { id?: string };
    const id = payload?.id?.trim();
    if (!id)
      return json({ message: "Note id is required" }, { status: 400 });

    const [noteRecord] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .limit(1);
    if (!noteRecord)
      return json({ message: "Note not found" }, { status: 404 });

    await db.delete(notes).where(eq(notes.id, noteRecord.id));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[api] delete-note", error);
    return json({ message: "Unable to delete note" }, { status: 500 });
  }
};
