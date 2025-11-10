import { db } from "$lib/server/db";
import { tasks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { id, value }: { id: string, value: boolean } = await request.json()
    await db.update(tasks).set({ status: value }).where(eq(tasks.id, id))
    return new Response(null, { status: 204 })
  } catch (e) {
    return new Response(null, { status: 500 })
  }
}
