import { db } from "$lib/server/db";
import { notes } from "$lib/server/db/schema";
import { and, eq, gt, gte, lt, lte, sql } from "drizzle-orm";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const {
      movedNoteId,
      positionMovedTo,
      positionMovedFrom
    }: {
      movedNoteId: string;
      positionMovedTo: number;
      positionMovedFrom: number;
    } = await request.json();

    if (
      typeof movedNoteId !== "string" ||
      typeof positionMovedTo !== "number" ||
      typeof positionMovedFrom !== "number"
    )
      return json({ message: "Invalid payload" }, { status: 400 });

    if (positionMovedTo === positionMovedFrom)
      return new Response(null, { status: 204 });

    const [originalNote] = await db.select().from(notes).where(eq(notes.id, movedNoteId));
    if (!originalNote)
      return json({ message: "Note not found" }, { status: 404 });

    const categoryId = originalNote.categoryId;

    if (positionMovedTo > positionMovedFrom) {
      await db
        .update(notes)
        .set({ position: sql`${notes.position} - 1` })
        .where(
          and(
            eq(notes.categoryId, categoryId),
            gt(notes.position, positionMovedFrom),
            lte(notes.position, positionMovedTo)
          )
        );
    } else {
      await db
        .update(notes)
        .set({ position: sql`${notes.position} + 1` })
        .where(
          and(
            eq(notes.categoryId, categoryId),
            gte(notes.position, positionMovedTo),
            lt(notes.position, positionMovedFrom)
          )
        );
    }

    await db.update(notes).set({ position: positionMovedTo }).where(eq(notes.id, movedNoteId));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[api] reorder-notes", error);
    return json({ message: "Unable to reorder notes" }, { status: 500 });
  }
};
