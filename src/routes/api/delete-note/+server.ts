import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";
import { notes } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const payload = (await request.json()) as { id?: string };
    const id = payload?.id?.trim();
    if (!id)
      return json({ message: "Note id is required" }, { status: 400 });

    await db.delete(notes).where(eq(notes.id, id));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[api] delete-note", error);
    return json({ message: "Unable to delete note" }, { status: 500 });
  }
};
