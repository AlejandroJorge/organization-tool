import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";
import { notes } from "$lib/server/db/schema";

export const DELETE: RequestHandler = async ({ request }) => {
  const { id }: { id: string } = await request.json()

  await db.delete(notes).where(eq(notes.id, id))

  return new Response(null, { status: 200 })
}
