import { fail } from "@sveltejs/kit"
import type { Actions } from "./$types"
import { db } from "$lib/server/db"
import { categories, notes, tasks } from "$lib/server/db/schema"
import { eq } from "drizzle-orm"

export const actions = {
  createCategory: async ({ request }) => {
    const data = await request.formData()
    const name = data.get("name") as string
    if (!name)
      return fail(400, { name, missing: true })

    await db.insert(categories).values({ name })

    return { success: true }
  },
  deleteCategory: async ({ request }) => {
    const data = await request.formData()
    const id = data.get("id") as string
    if (!id)
      return fail(400, { id, missing: true })

    const tasksQuery = await db.select().from(tasks).limit(1).where(eq(tasks.categoryId, id))
    if (tasksQuery.length > 0)
      return fail(400, { id })

    const notesQuery = await db.select().from(notes).limit(1).where(eq(notes.categoryId, id))
    if (notesQuery.length > 0)
      return fail(400, { id })

    await db.delete(categories).where(eq(categories.id, id))

    return { success: true }
  }
} satisfies Actions
