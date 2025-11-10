import { db } from "$lib/server/db";
import { tasks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ request }) => {
  const { id }: { id: string } = await request.json()
  console.log(await db.select().from(tasks).where(eq(tasks.id, id)));

  await db.delete(tasks).where(eq(tasks.id, id))

  return new Response(null, { status: 200 })
}
