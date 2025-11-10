import { db } from "$lib/server/db";
import { tasks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const { id }: { id: string } = await request.json()
    await db.delete(tasks).where(eq(tasks.id, id))
    return new Response(null, { status: 200 })
  } catch (e) {
    return new Response(null, { status: 500 })
  }
}
